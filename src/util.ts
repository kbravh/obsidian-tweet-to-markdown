import {
  App,
  Editor,
  MarkdownView,
  normalizePath,
  Notice,
  Platform,
  request,
  TAbstractFile,
} from 'obsidian'
import {createDownloadManager, DownloadManager} from './downloadManager'
import {Media, Poll, Tweet} from './models'
import {moment} from 'obsidian'
import TTM from 'main'
import {TTMSettings} from './settings'
import {unicodeSubstring} from './unicodeSubstring'
import {v4 as uuid} from 'uuid'

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

export const getTweet = async (id: string, bearer: string): Promise<Tweet> => {
  if (bearer.startsWith('TTM>')) {
    return getTweetFromTTM(id, bearer)
  }
  return getTweetFromTwitter(id, bearer)
}

/**
 * Fetches a tweet object from the Twitter v2 API
 * @param {string} id - The ID of the tweet to fetch from the API
 * @param {string} bearer - The bearer token
 * @returns {Tweet} - The tweet from the Twitter API
 */
const getTweetFromTwitter = async (
  id: string,
  bearer: string
): Promise<Tweet> => {
  const twitterUrl = new URL(`https://api.twitter.com/2/tweets/${id}`)
  const params = new URLSearchParams({
    expansions: 'author_id,attachments.poll_ids,attachments.media_keys',
    'user.fields': 'name,username,profile_image_url',
    'tweet.fields':
      'attachments,public_metrics,entities,conversation_id,referenced_tweets,created_at',
    'media.fields': 'url,alt_text',
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
 * Fetches a tweet object from the TTM service API
 * @param {string} id - The ID of the tweet to fetch from the API
 * @param {string} bearer - The bearer token
 * @returns {Promise<Tweet>} - The tweet from the Twitter API
 */
const getTweetFromTTM = async (id: string, bearer: string): Promise<Tweet> => {
  const ttmUrl = new URL('https://ttm.kbravh.dev/api/tweet')
  const params = new URLSearchParams({
    tweet: id,
  })
  let tweetRequest
  try {
    tweetRequest = await request({
      method: 'GET',
      url: `${ttmUrl.href}?${params.toString()}`,
      headers: {Authorization: `Bearer ${bearer}`},
    })
  } catch (error) {
    if (error.request) {
      throw new Error(error.request)
    }
  }
  const tweet: Tweet = JSON.parse(tweetRequest)
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
 * Filename sanitization. Credit: parshap/node-sanitize-filename
 * Rewrite to allow functionality on Obsidian mobile.
 */
const illegalRe = /[/?<>\\:*|"]/g
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i
const windowsTrailingRe = /[. ]+$/

/**
 * Sanitize a filename to remove any illegal characters.
 * Also keeps the filename to 255 bytes or below.
 * @param filename string
 * @returns string
 */
export const sanitizeFilename = (filename: string): string => {
  filename = filename
    .replace(illegalRe, '')
    .replace(controlRe, '')
    .replace(reservedRe, '')
    .replace(windowsReservedRe, '')
    .replace(windowsTrailingRe, '')
  return truncateBytewise(filename, 252)
}

/**
 * Truncate a string to a specified number of bytes
 * @param string the string to truncate
 * @param length the maximum length in bytes of the trimmed string
 * @returns string
 */
export const truncateBytewise = (string: string, length: number): string => {
  const originalLength = length
  while (new TextEncoder().encode(string).length > originalLength) {
    string = unicodeSubstring(string, 0, length--)
  }
  return string
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
  filename = filename.replace('[[text]]', tweet.data.text)
  return sanitizeFilename(filename) + '.md'
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
            return `\n![${medium.alt_text ?? medium.media_key}](${filepath})`
          default:
            break
        }
      } else {
        switch (medium.type) {
          case 'photo':
            return `\n![${medium.alt_text ?? medium.media_key}](${medium.url})`
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
  type: 'normal' | 'embed' | 'thread' | 'quoted' = 'normal'
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

  const date = moment(tweet.data.created_at)
    .locale(plugin.settings.dateLocale)
    .format(plugin.settings.dateFormat)
  /**
   * Define the frontmatter as the name, handle, and source url
   */
  const frontmatter = [
    '---',
    `author: "${user.name}"`,
    `handle: "@${user.username}"`,
    `source: "https://twitter.com/${user.username}/status/${tweet.data.id}"`,
    `date: "${date}"`,
    ...metrics,
    '---',
  ]

  const assetPath = plugin.settings.assetLocation || 'assets'
  let markdown = []
  if (plugin.settings.avatars) {
    markdown.push(
      `![${user.username}](${
        plugin.settings.downloadAssets
          ? normalizePath(`${assetPath}/${user.username}-${user.id}.jpg`)
          : user.profile_image_url
      })` // profile image
    )
  }
  markdown.push(
    `${user.name} ([@${user.username}](https://twitter.com/${user.username})) - ${date}`, // name, handle, and date
    '\n',
    `${text}`
  ) // text of the tweet

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
    downloadImages(app, downloadManager, tweet, plugin)
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

  // add original tweet link to end of tweet
  markdown.push(
    '\n\n' +
      `[Tweet link](https://twitter.com/${user.username}/status/${tweet.data.id})`
  )

  // convert mobile.twitter.com links to regular links since they'll redirect anyway
  markdown = markdown.map(line =>
    line.replace(/https?:\/\/mobile.twitter.com/g, 'https://twitter.com')
  )

  switch (type) {
    case 'normal':
      return frontmatter.concat(markdown).join('\n')
    case 'embed':
      return markdown.join('\n')
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
  plugin: TTM
): void => {
  const assetLocation = plugin.settings.assetLocation || 'assets'
  const user = tweet.includes.users[0]

  // create the image folder
  app.vault.createFolder(assetLocation).catch(() => {})

  let filesToDownload = []

  if (plugin.settings.avatars) {
    filesToDownload.push({
      url: user.profile_image_url,
      title: `${user.username}-${user.id}.jpg`,
    })
  }

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

export const pasteTweet = async (
  event: ClipboardEvent,
  editor: Editor,
  markdownView: MarkdownView,
  plugin: TTM
): Promise<void> => {
  // early escapes
  if (!plugin.settings.tweetLinkFetch) return // feature disabled
  if (!navigator.onLine) return // offline
  if (event.defaultPrevented) return // paste already handled

  const clipboardText = event.clipboardData.getData('text/plain')

  // determine if it's a Twitter URL
  if (!isTwitterUrl(clipboardText)) return
  let id = ''
  try {
    id = getTweetID(clipboardText)
  } catch (error) {
    return
  }

  // if it is a Tweet link, check for bearer token
  let bearerToken
  if (Platform.isMobileApp) {
    bearerToken = plugin.settings.bearerToken || ''
  } else {
    bearerToken =
      plugin.settings.bearerToken || process.env.TWITTER_BEARER_TOKEN || ''
  }
  if (!bearerToken) {
    new Notice('Twitter bearer token was not found.')
    return
  }
  plugin.bearerToken = bearerToken

  // determine if the user is pasting into a spot we don't want to interfere
  if (isInMarkdownLink(editor) || isInQuote(editor)) return

  // We've decided to handle the paste, stop propagation to the default handler.
  event.preventDefault()
  const placeholder = `Fetching tweet ${id}...`
  editor.replaceSelection(placeholder)

  const downloadManager = createDownloadManager()
  try {
    plugin.currentTweet = await getTweet(id, bearerToken)
  } catch (error) {
    let text = editor.getValue()
    text = text.replace(placeholder, `Error retrieving tweet: ${clipboardText}`)
    editor.setValue(text)
  }

  const markdown = await buildMarkdown(
    plugin.app,
    plugin,
    downloadManager,
    plugin.currentTweet,
    'embed'
  )

  plugin.currentTweetMarkdown = markdown + plugin.currentTweetMarkdown

  // clean up excessive newlines
  plugin.currentTweetMarkdown = plugin.currentTweetMarkdown.replace(
    /\n{2,}/g,
    '\n\n'
  )

  await downloadManager
    .finishDownloads()
    .then(results => {
      if (results.length) {
        new Notice('Images downloaded')
      }
    })
    .catch(error => {
      new Notice('There was an error downloading the images.')
      console.error(error)
    })

  // embed the processed tweet
  let text = editor.getValue()

  if (plugin.settings.embedMethod === 'text') {
    text = text.replace(placeholder, plugin.currentTweetMarkdown)
  } else {
    let filename = createFilename(plugin.currentTweet, plugin.settings.filename)
    const fileExists = doesFileExist(
      plugin.app,
      `${plugin.settings.noteLocation}/${filename}`
    )
    if (fileExists) {
      // just unique-ify the title for now
      filename = `${uuid().substring(0, 8)}-${filename}`
    }
    if (plugin.settings.noteLocation) {
      // create the directory
      const doesFolderExist = await plugin.app.vault.adapter.exists(
        plugin.settings.noteLocation
      )
      if (!doesFolderExist) {
        await plugin.app.vault
          .createFolder(plugin.settings.noteLocation)
          .catch(error => {
            new Notice('Error creating tweet directory.')
            console.error(
              'There was an error creating the tweet directory.',
              error
            )
          })
      }
    }
    await plugin.app.vault.create(
      `${plugin.settings.noteLocation}/${filename}`,
      plugin.currentTweetMarkdown
    )
    text = text.replace(placeholder, `![[${filename}]]`)
  }

  editor.setValue(text)
  // cleanup
  plugin.currentTweet = null
  plugin.currentTweetMarkdown = ''
}

export const isTwitterUrl = (text: string): boolean =>
  /^t?https?:\/\/(mobile\.)?twitter.com\/\w+\/status\/\w+/i.test(text)

export const isInMarkdownLink = (editor: Editor): boolean => {
  const {ch, line} = editor.getCursor()
  const preceding = editor.getRange({ch: ch - 2, line}, {ch, line})
  return preceding === ')['
}
export const isInQuote = (editor: Editor): boolean => {
  const {ch, line} = editor.getCursor()
  const preceding = editor.getRange({ch: ch - 1, line}, {ch, line})
  return /["'`]/.test(preceding)
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
