import {App, normalizePath, request, TAbstractFile} from 'obsidian'
import {Media, Poll, Tweet} from './models'
import {DownloadManager} from './downloadManager'
import TTM from 'main'
import {TTMSettings} from './settings'

/**
 * Parses out the tweet ID from the URL the user provided
 * @param {string} src - The URL
 */
export const getTweetID = (src: string): string => {
  // Create a URL object with the source. If it fails, it's not a URL.
  const url = new URL(src)
  const id = url.pathname
    .split('/')
    .filter(piece => !!piece) // remove empty strings from array
    .slice(-1)[0]
  if (!id) {
    throw new Error('URL does not seem to be a tweet.')
  }
  return id
}

/**
 * Fetches a tweet object from the Twitter v2 API
 * @param {string} id - The ID of the tweet to fetch from the API
 * @param {string} bearer - The bearer token
 * @returns {Tweet} - The tweet from the Twitter API
 */
export const getTweet = async (id: string, bearer: string): Promise<Tweet> => {
  const twitterUrl = new URL(`https://api.twitter.com/2/tweets/${id}`)
  const params = new URLSearchParams({
    expansions: 'author_id,attachments.poll_ids,attachments.media_keys',
    'user.fields': 'name,username,profile_image_url',
    'tweet.fields':
      'attachments,public_metrics,entities,conversation_id,referenced_tweets',
    'media.fields': 'url',
    'poll.fields': 'options',
  })

  let tweetRequest
  try {
    tweetRequest = await request({
      method: 'GET',
      url: `${twitterUrl.href}?${params.toString()}`,
      headers: {Authorization: `Bearer ${bearer}`},
    })
  } catch (error) {
    if (error.request) {
      throw new Error('There seems to be a connection issue.')
    } else {
      console.error(error)
      throw error
    }
  }
  const tweet: Tweet = JSON.parse(tweetRequest)
  if (tweet.errors) {
    throw new Error(tweet.errors[0].detail)
  }
  if (tweet?.reason) {
    switch (tweet.reason) {
      case 'client-not-enrolled':
      default:
        throw new Error('There seems to be a problem with your bearer token.')
    }
  }
  return tweet
}

/**
 * Creates markdown table to capture poll options and votes
 * @param {Poll[]} polls - The polls array provided by the Twitter v2 API
 * @returns {string} - Markdown table as a string of the poll
 */
export const createPollTable = (polls: Poll[]): string[] => {
  return polls.map((poll: Poll) => {
    const table = ['\n|Option|Votes|', '|---|:---:|']
    const options = poll.options.map(
      option => `|${option.label}|${option.votes}|`
    )
    return table.concat(options).join('\n')
  })
}

/**
 * Creates a filename based on the tweet and the user defined options.
 * @param {Tweet} tweet - The entire tweet object from the Twitter v2 API
 * @param {filename} string - The filename provided by the user
 * @returns {string} - The filename based on tweet and options
 */
export const createFilename = (tweet: Tweet, filename = ''): string => {
  filename = filename ? filename : '[[handle]] - [[id]]'
  filename = filename.replace(/\.md$/, '') // remove md extension if provided
  filename = filename.replace('[[name]]', tweet.includes.users[0].name)
  filename = filename.replace('[[handle]]', tweet.includes.users[0].username)
  filename = filename.replace('[[id]]', tweet.data.id)
  filename = filename.replace('[[text]]', normalizePath(tweet.data.text))
  filename += '.md'
  return filename
}

/**
 * Creates media links to embed media into the markdown file
 * @param {Media[]} media - The tweet media object provided by the Twitter v2 API
 * @returns {string[]} - An array of markdown image links
 */
export const createMediaElements = (
  settings: TTMSettings,
  media: Media[]
): string[] => {
  return media
    .map((medium: Media) => {
      if (settings.downloadAssets) {
        const assetLocation = settings.assetLocation || 'assets'
        const filepath = normalizePath(
          `${assetLocation}/${medium.media_key}.jpg`
        )
        switch (medium.type) {
          case 'photo':
            return `\n![${medium.media_key}](${filepath})`
          default:
            break
        }
      } else {
        switch (medium.type) {
          case 'photo':
            return `\n![${medium.media_key}](${medium.url})`
          default:
            break
        }
      }
    })
    .filter(medium => !!medium)
}

/**
 * Creates the entire Markdown string of the provided tweet
 */
export const buildMarkdown = async (
  app: App,
  plugin: TTM,
  downloadManager: DownloadManager,
  tweet: Tweet,
  type: 'normal' | 'thread' | 'quoted' = 'normal'
): Promise<string> => {
  let metrics: string[] = []
  metrics = [
    `likes: ${tweet.data.public_metrics.like_count}`,
    `retweets: ${tweet.data.public_metrics.retweet_count}`,
    `replies: ${tweet.data.public_metrics.reply_count}`,
  ]

  let text = tweet.data.text
  const user = tweet.includes.users[0]

  /**
   * replace entities with markdown links
   */
  if (tweet.data?.entities) {
    /**
     * replace any mentions, hashtags, cashtags, urls with links
     */
    tweet.data.entities?.mentions &&
      tweet.data.entities?.mentions.forEach(({username}) => {
        text = text.replace(
          `@${username}`,
          `[@${username}](https://twitter.com/${username})`
        )
      })
    tweet.data.entities?.hashtags &&
      tweet.data.entities?.hashtags.forEach(({tag}) => {
        text = text.replace(
          `#${tag}`,
          `[#${tag}](https://twitter.com/hashtag/${tag}) `
        )
      })
    tweet.data.entities?.cashtags &&
      tweet.data.entities?.cashtags.forEach(({tag}) => {
        text = text.replace(
          `$${tag}`,
          `[$${tag}](https://twitter.com/search?q=%24${tag})`
        )
      })
    tweet.data.entities?.urls &&
      tweet.data.entities?.urls.forEach(url => {
        text = text.replace(
          url.url,
          `[${url.display_url}](${url.expanded_url})`
        )
      })
  }

  /**
   * Define the frontmatter as the name, handle, and source url
   */
  const frontmatter = [
    '---',
    `author: "${user.name}"`,
    `handle: "@${user.username}"`,
    `source: "https://twitter.com/${user.username}/status/${tweet.data.id}"`,
    ...metrics,
    '---',
  ]

  const assetPath = plugin.settings.assetLocation || 'assets'
  let markdown = [
    `![${user.username}](${
      plugin.settings.downloadAssets
        ? normalizePath(`${assetPath}/${user.username}-${user.id}.jpg`)
        : user.profile_image_url
    })`, // profile image
    `${user.name} ([@${user.username}](https://twitter.com/${user.username}))`, // name and handle
    '\n',
    `${text}`, // text of the tweet
  ]

  // markdown requires 2 line breaks for actual new lines
  markdown = markdown.map(line => line.replace(/\n/g, '\n\n'))

  // Add in other tweet elements
  if (tweet.includes?.polls) {
    markdown = markdown.concat(createPollTable(tweet.includes.polls))
  }

  if (tweet.includes?.media) {
    markdown = markdown.concat(
      createMediaElements(plugin.settings, tweet.includes?.media)
    )
  }

  // download images
  if (plugin.settings.downloadAssets) {
    downloadImages(
      app,
      downloadManager,
      tweet,
      plugin.settings.assetLocation || 'assets'
    )
  }

  // check for quoted tweets to be included
  if (tweet.data?.referenced_tweets) {
    for (const subtweet_ref of tweet.data?.referenced_tweets) {
      if (subtweet_ref?.type === 'quoted') {
        const subtweet = await getTweet(subtweet_ref.id, plugin.bearerToken)
        const subtweet_text = await buildMarkdown(
          app,
          plugin,
          downloadManager,
          subtweet,
          'quoted'
        )
        markdown.push('\n\n' + subtweet_text)
      }
    }
  }

  // indent all lines for a quoted tweet
  if (type === 'quoted') {
    markdown = markdown.map(line => '> ' + line)
  }

  switch (type) {
    case 'normal':
      return frontmatter.concat(markdown).join('\n')
    case 'thread':
      return '\n\n---\n\n' + markdown.join('\n')
    case 'quoted':
      return '\n\n' + markdown.join('\n')
    default:
      return '\n\n' + markdown.join('\n')
  }
}

export const downloadImages = (
  app: App,
  downloadManager: DownloadManager,
  tweet: Tweet,
  assetLocation = 'assets'
): void => {
  const user = tweet.includes.users[0]

  // create the image folder
  app.vault.createFolder(assetLocation).catch(() => {})

  let filesToDownload = []
  filesToDownload.push({
    url: user.profile_image_url,
    title: `${user.username}-${user.id}.jpg`,
  })

  tweet.includes?.media?.forEach((medium: Media) => {
    switch (medium.type) {
      case 'photo':
        filesToDownload.push({
          url: medium.url,
          title: `${medium.media_key}.jpg`,
        })
        break
      default:
        break
    }
  })

  //Filter out tweet images that already exist locally
  filesToDownload = filesToDownload.filter(
    file => !doesFileExist(app, `${assetLocation}/${file.title}`)
  )

  if (!filesToDownload.length) {
    return
  }

  downloadManager.addDownloads(
    filesToDownload.map(async file => {
      const imageRequest = await fetch(file.url, {
        method: 'GET',
      })
      const image = await imageRequest.arrayBuffer()
      return await app.vault.createBinary(
        `${assetLocation}/${file.title}`,
        image
      )
    })
  )
}

export const doesFileExist = (app: App, filepath: string): boolean => {
  filepath = normalizePath(filepath)
  // see if file already exists
  let file: TAbstractFile
  try {
    file = app.vault.getAbstractFileByPath(filepath)
  } catch (error) {
    return false
  }
  return !!file
}
