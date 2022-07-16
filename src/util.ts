import 'core-js/actual/array/flat-map'
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
import type {Media, Poll, Tweet, User} from './types/tweet'
import {decode} from 'html-entities'
import {moment} from 'obsidian'
import {TimestampFormat} from './types/plugin'
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
  if (tweet?.status === 401) {
    throw new Error('There seems to be a problem with your bearer token.')
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
    source: 'obsidian',
  })
  let tweetRequest
  try {
    tweetRequest = await fetch(`${ttmUrl.href}?${params.toString()}`, {
      method: 'GET',
      headers: {Authorization: `Bearer ${bearer}`},
    })
  } catch (error) {
    throw new Error(error)
  }

  if (!tweetRequest.ok || tweetRequest.status !== 200) {
    const message = await tweetRequest.text()
    if (message.includes('Sorry, you are not authorized to see the Tweet')) {
      throw new Error('This tweet is unavailable to be viewed')
    }
    throw new Error(message)
  }

  const tweet: Tweet = await tweetRequest.json()

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
const illegalRe = /[?<>\\:*|"]/g
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
export const sanitizeFilename = (
  filename: string,
  alter: 'encode' | 'decode' | 'none' = 'none',
  type: 'file' | 'directory' = 'file'
): string => {
  filename = filename
    .replace(illegalRe, '')
    .replace(controlRe, '')
    .replace(reservedRe, '')
    .replace(windowsReservedRe, '')
    .replace(windowsTrailingRe, '')
  if (type === 'file') {
    filename = filename.replace(/\//g, '')
  }
  if (alter === 'decode') {
    filename = decodeURI(filename)
  } else if (alter === 'encode') {
    filename = encodeURI(filename)
  }
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
 * @param tweet - The entire tweet object from the Twitter v2 API
 * @param filename - The filename provided by the user
 * @returns - The filename based on tweet and options
 */
export const createFilename = (
  tweet: Tweet,
  filename = '',
  timestampFormat: TimestampFormat,
  type: 'file' | 'directory' = 'file'
): string => {
  filename = filename ? filename : '[[handle]] - [[id]]'
  filename = filename.replace(/\.md$/, '') // remove md extension if provided
  filename = filename.replace(/\[\[name\]\]/gi, tweet.includes.users[0].name)
  filename = filename.replace(
    /\[\[handle\]\]/gi,
    tweet.includes.users[0].username
  )
  filename = filename.replace(/\[\[id\]\]/gi, tweet.data.id)
  filename = filename.replace(/\[\[text\]\]/gi, tweet.data.text)
  // date
  const dateRegex = /\[\[(date[:\w-]*)\]\]/
  if (dateRegex.test(filename)) {
    const dateCommand = filename.match(dateRegex)
    if (dateCommand) {
      const [, format, locale] = dateCommand[1].split(':')
      filename = filename.replace(
        dateRegex,
        formatTimestamp(tweet.data.created_at, {
          format: format || timestampFormat.format,
          locale: locale || timestampFormat.locale,
        })
      )
    }
  }
  return type === 'file'
    ? sanitizeFilename(filename) + '.md'
    : sanitizeFilename(filename, 'decode', 'directory')
}

export const formatTimestamp = (
  timestamp: string,
  timestampFormat: TimestampFormat
): string =>
  moment(timestamp)
    .locale(timestampFormat.locale)
    .format(timestampFormat.format)

/**
 * Creates media links to embed media into the markdown file
 * @param tweet - The entire tweet object from the Twitter v2 API
 * @returns {string[]} - An array of markdown image links
 */
export const createMediaElements = (
  settings: TTMSettings,
  tweet: Tweet
): string[] => {
  const media = tweet.includes?.media
  return media
    .map((medium: Media) => {
      if (settings.downloadAssets) {
        const assetLocation = decodeURI(settings.assetLocation || 'assets')
        const alter =
          settings.imageEmbedStyle === 'markdown' ? 'encode' : 'decode'
        const filepath = normalizePath(
          `${sanitizeFilename(
            createFilename(
              tweet,
              assetLocation,
              {
                locale: settings.dateLocale,
                format: settings.dateFormat,
              },
              'directory'
            ),
            alter,
            'directory'
          )}/${sanitizeFilename(medium.media_key, alter)}.jpg`
        )
        switch (medium.type) {
          case 'photo':
            if (settings.imageEmbedStyle === 'markdown') {
              return `\n![${medium.alt_text ?? medium.media_key}${
                settings.imageSize ? `|${settings.imageSize}` : ''
              }](${filepath})`
            } else {
              return `\n![[${filepath}${
                settings.imageSize ? `|${settings.imageSize}` : ''
              }]]`
            }
          default:
            break
        }
      } else {
        switch (medium.type) {
          case 'photo':
            return `\n![${medium.alt_text ?? medium.media_key}${
              settings.imageSize ? `|${settings.imageSize}` : ''
            }](${medium.url})`
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
  type: 'normal' | 'embed' | 'thread' | 'quoted' = 'normal',
  previousAuthor?: User
): Promise<string> => {
  if (type === 'thread' && !previousAuthor) {
    throw new Error('A thread tweet must have a previous author')
  }

  let text = decode(tweet.data.text)
  const user = tweet.includes.users[0]

  const isCondensedThreadTweet = !(
    type !== 'thread' ||
    (type === 'thread' && !plugin.settings.condensedThread) ||
    (type === 'thread' &&
      plugin.settings.condensedThread &&
      user.id !== previousAuthor.id)
  )

  let metrics: string[] = []
  metrics = [
    `likes: ${tweet.data.public_metrics.like_count}`,
    `retweets: ${tweet.data.public_metrics.retweet_count}`,
    `replies: ${tweet.data.public_metrics.reply_count}`,
  ]

  /**
   * replace entities with markdown links
   */
  if (tweet.data?.entities && plugin.settings.includeLinks) {
    /**
     * replace any mentions, hashtags, cashtags, urls with links
     */
    tweet.data.entities?.mentions?.forEach(({username}) => {
      text = text.replace(
        `@${username}`,
        `[@${username}](https://twitter.com/${username})`
      )
    })
    tweet.data.entities?.hashtags?.forEach(({tag}) => {
      text = text.replace(
        `#${tag}`,
        `[#${tag}](https://twitter.com/hashtag/${tag}) `
      )
    })
    tweet.data.entities?.cashtags?.forEach(({tag}) => {
      text = text.replace(
        `$${tag}`,
        `[$${tag}](https://twitter.com/search?q=%24${tag})`
      )
    })
    tweet.data.entities?.urls?.forEach(url => {
      text = text.replace(url.url, `[${url.display_url}](${url.expanded_url})`)
    })
  }

  const date = formatTimestamp(tweet.data.created_at, {
    locale: plugin.settings.dateLocale,
    format: plugin.settings.dateFormat,
  })

  const displayDate = (plugin: TTM, date: string): string =>
    plugin.settings.includeDate ? ` - ${date}` : ''
  /**
   * Define the frontmatter as the name, handle, and source url
   */
  const frontmatter = []
  if (plugin.settings.frontmatter) {
    const fetchedAt = formatTimestamp(new Date().toString(), {
      locale: plugin.settings.dateLocale,
      format: plugin.settings.dateFormat,
    })
    frontmatter.push(
      ...[
        '---',
        `author: "${user.name}"`,
        `handle: "@${user.username}"`,
        `source: "https://twitter.com/${user.username}/status/${tweet.data.id}"`,
        `date: "${date}"`,
        `fetched: "${fetchedAt}"`,
        ...metrics,
      ]
    )
    if (plugin.settings.cssclass) {
      frontmatter.push(`cssclass: ${plugin.settings.cssclass}`)
    }
    if (plugin.settings.tags.length) {
      frontmatter.push(
        `tags: [${plugin.settings.tags.map(tag => `"${tag}"`).join(', ')}]`
      )
    }
    if (plugin.settings.freeformFrontmatter.length) {
      frontmatter.push(...plugin.settings.freeformFrontmatter)
    }
    // close out frontmatter
    frontmatter.push('---')
  }

  const assetPath = decodeURI(plugin.settings.assetLocation || 'assets')
  let markdown = []
  if (plugin.settings.avatars) {
    if (!isCondensedThreadTweet) {
      const obsidianImageEmbeds =
        plugin.settings.imageEmbedStyle === 'obsidian' &&
        plugin.settings.downloadAssets
      const alter = obsidianImageEmbeds ? 'decode' : 'encode'
      const filename = `${normalizePath(
        `${sanitizeFilename(
          createFilename(
            tweet,
            assetPath,
            {
              locale: plugin.settings.dateLocale,
              format: plugin.settings.dateFormat,
            },
            'directory'
          ),
          alter,
          'directory'
        )}/${getAvatarFilename(user)}`
      )}`
      if (obsidianImageEmbeds) {
        markdown.push(
          `![[${filename}${
            plugin.settings.avatarSize ? `|${plugin.settings.avatarSize}` : ''
          }]]`
        )
      } else {
        markdown.push(
          `![${user.username}${
            plugin.settings.avatarSize ? `|${plugin.settings.avatarSize}` : ''
          }](${
            plugin.settings.downloadAssets ? filename : user.profile_image_url
          })` // profile image
        )
      }
    }
  }

  if (isCondensedThreadTweet) {
    markdown.push(text)
  } else if (!plugin.settings.includeLinks) {
    markdown.push(
      `${user.name} (${user.username})${displayDate(plugin, date)}`, // name, handle, and date
      '\n',
      text
    )
  } else {
    markdown.push(
      `${user.name} ([@${user.username}](https://twitter.com/${
        user.username
      }))${displayDate(plugin, date)}`, // name, handle, and date
      '\n',
      text
    ) // text of the tweet
  }

  // remove newlines from within tweet text to avoid breaking our formatting
  markdown = markdown.flatMap(line => line.split('\n'))

  // Add in other tweet elements
  if (tweet.includes?.polls) {
    markdown = markdown.concat(createPollTable(tweet.includes.polls))
  }

  if (tweet.includes?.media && plugin.settings.includeImages) {
    markdown = markdown.concat(createMediaElements(plugin.settings, tweet))
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
        let subtweet_text
        try {
          subtweet_text = await buildMarkdown(
            app,
            plugin,
            downloadManager,
            subtweet,
            'quoted'
          )
        } catch (error) {
          new Notice('There was a problem processing the downloaded tweet')
        }
        markdown.push('\n\n' + subtweet_text)
      }
    }
  }

  // add original tweet link to end of tweet
  if (plugin.settings.includeLinks && !plugin.settings.condensedThread) {
    markdown.push(
      '',
      '',
      `[Tweet link](https://twitter.com/${user.username}/status/${tweet.data.id})`
    )
  }

  // indent all lines for a quoted tweet
  if (type === 'quoted') {
    markdown = markdown.map(line => '> ' + line)
  }

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
      return markdown.join('\n')
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
  const assetLocation = sanitizeFilename(
    createFilename(
      tweet,
      plugin.settings.assetLocation,
      {
        locale: plugin.settings.dateLocale,
        format: plugin.settings.dateFormat,
      },
      'directory'
    ) || 'assets',
    'decode',
    'directory'
  )
  const user = tweet.includes.users[0]

  // create the image folder
  app.vault.createFolder(assetLocation).catch(() => {})

  let filesToDownload = []

  if (plugin.settings.avatars) {
    // concat new filename
    filesToDownload.push({
      url: user.profile_image_url,
      title: getAvatarFilename(user),
    })
  }

  if (plugin.settings.includeImages) {
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
  }

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

export const getAvatarFilename = (user: User): string => {
  // e.g. [ '', 'profile_images', '1539402405506334721', '1V5Xt64P_normal.jpg' ]
  const urlSplit = new URL(user.profile_image_url).pathname.split('/')
  // '1143604512999034881-1V5Xt64P_normal.jpg'
  const title = `${user.id}-${urlSplit[urlSplit.length - 1]}`
  return title
}

export const pasteTweet = async (
  event: ClipboardEvent,
  editor: Editor,
  _: MarkdownView,
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
  const bearerToken = getBearerToken(plugin)
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

  let tweet: Tweet

  const downloadManager = createDownloadManager()
  try {
    tweet = await getTweet(id, bearerToken)
  } catch (error) {
    let text = editor.getValue()
    text = text.replace(placeholder, `Error retrieving tweet: ${clipboardText}`)
    editor.setValue(text)
  }

  let markdown
  try {
    markdown = await buildMarkdown(
      plugin.app,
      plugin,
      downloadManager,
      tweet,
      plugin.settings.embedMethod === 'text' ? 'embed' : 'normal'
    )
  } catch (error) {
    new Notice('There was a problem processing the downloaded tweet')
    tweet = null
    return
  }

  // clean up excessive newlines
  markdown = markdown.replace(/\n{2,}/g, '\n\n')

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
    text = text.replace(placeholder, markdown)
  } else {
    let filename = createFilename(tweet, plugin.settings.filename, {
      locale: plugin.settings.dateLocale,
      format: plugin.settings.dateFormat,
    })
    filename = sanitizeFilename(filename, 'decode')
    const location = sanitizeFilename(
      createFilename(
        tweet,
        plugin.settings.noteLocation,
        {
          locale: plugin.settings.dateLocale,
          format: plugin.settings.dateFormat,
        },
        'directory'
      ),
      'decode',
      'directory'
    )
    const fileExists = doesFileExist(plugin.app, `${location}/${filename}`)
    if (fileExists) {
      // just unique-ify the title for now
      filename = `${uuid().substring(0, 8)}-${filename}`
    }
    if (location) {
      // create the directory
      const doesFolderExist = await plugin.app.vault.adapter.exists(location)
      if (!doesFolderExist) {
        await plugin.app.vault.createFolder(location).catch(error => {
          new Notice('Error creating tweet directory.')
          console.error(
            'There was an error creating the tweet directory.',
            error
          )
        })
      }
    }
    const sanitizedFilename = `${location}/${filename}`
    await plugin.app.vault.create(sanitizedFilename, markdown)
    text = text.replace(placeholder, `![[${filename}]]`)
  }

  editor.setValue(text)
  // cleanup
  tweet = null
  markdown = ''
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

export const getBearerToken = (plugin: TTM): string => {
  if (Platform.isMobileApp) {
    return plugin.settings.bearerToken || ''
  } else {
    return (
      plugin.settings.bearerToken ||
      process.env.TTM_API_KEY ||
      process.env.TWITTER_BEARER_TOKEN ||
      ''
    )
  }
}

export const tweetStateCleanup = (plugin: TTM): void => {
  plugin.tweetMarkdown = ''
}
