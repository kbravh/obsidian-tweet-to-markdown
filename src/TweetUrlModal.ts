import {App, Modal, Notice, Setting} from 'obsidian'
import {
  buildMarkdown,
  getBearerToken,
  getTweet,
  getTweetID,
  tweetStateCleanup,
} from './util'
import {createDownloadManager, DownloadManager} from './downloadManager'
import TTM from 'main'
import {TweetCompleteModal} from './TweetCompleteModal'
import {Tweet} from './types/tweet'

export class TweetUrlModal extends Modal {
  url = ''
  plugin
  thread = false
  downloadManager: DownloadManager
  constructor(app: App, plugin: TTM) {
    super(app)
    this.plugin = plugin
  }

  onOpen(): void {
    const {contentEl, titleEl} = this
    titleEl.setText('Download Tweet')

    new Setting(contentEl)
      .setName('Tweet URL')
      .setDesc('Enter the URL of the tweet to download.')
      .addText(input => {
        input
          .setValue(this.url)
          .onChange(value => (this.url = value))
          .setPlaceholder('Tweet URL')
      })

    new Setting(contentEl)
      .setName('Tweet thread')
      .setDesc(
        'Download a tweet thread. (Put the link to the LAST tweet in the thread).'
      )
      .addToggle(toggle => {
        toggle.setValue(false).onChange(value => {
          this.thread = value
        })
      })

    new Setting(contentEl)
      .setClass('download_tweet_button')
      .addButton(button => {
        button.setButtonText('Download Tweet')
        button.onClick(async () => {
          if (!navigator.onLine) {
            new Notice('You seem to be offline.')
            return
          }
          // error checking for kickoff
          const bearerToken = getBearerToken(this.plugin)
          if (!bearerToken) {
            new Notice('Bearer token was not found.')
            return
          }

          if (!this.url) {
            new Notice('No tweet link provided.')
            return
          }
          let id = ''
          try {
            id = getTweetID(this.url)
          } catch (error) {
            new Notice(error.message)
            return
          }

          this.plugin.bearerToken = bearerToken

          this.downloadManager = createDownloadManager()

          // set the button as loading
          button.setButtonText('Loading...')
          button.setDisabled(true)

          let threadCount = 0
          const tweets: Tweet[] = []
          let currentTweet: Tweet

          // fetch tweet
          try {
            currentTweet = await getTweet(id, bearerToken)
          } catch (error) {
            new Notice(error.message)
            // set the button as not loading
            button.setButtonText('Download Tweet')
            button.setDisabled(false)
            return
          }
          tweets.push(currentTweet)
          button.setButtonText(`${++threadCount} tweet fetched...`)

          // special handling for threads
          if (this.thread) {
            // check if this is the head tweet
            while (currentTweet.data.conversation_id !== currentTweet.data.id) {
              // load in parent tweet
              const [parent_tweet] = currentTweet.data.referenced_tweets.filter(
                ref_tweet => ref_tweet.type === 'replied_to'
              )
              try {
                currentTweet = await getTweet(parent_tweet.id, bearerToken)
                tweets.push(currentTweet)
                button.setButtonText(`${++threadCount} tweets fetched...`)
              } catch (error) {
                if (
                  error.message.includes(
                    'This tweet is unavailable to be viewed'
                  )
                ) {
                  new Notice(
                    'One of the tweets in this thread is unavailable to be viewed. Download failed.'
                  )
                } else {
                  new Notice(error.message)
                }
                this.plugin.tweetMarkdown = ''
                // set the button as not loading
                button.setButtonText('Download Tweet')
                button.setDisabled(false)
                return
              }
            }
          }

          // reverse the thread so the tweets are in chronological order
          tweets.reverse()
          this.plugin.tweetMarkdown = ''

          const markdownsOrMarksdown = await Promise.all(
            tweets.map(async (tweet, index) => {
              let markdown
              try {
                markdown = await buildMarkdown(
                  this.app,
                  this.plugin,
                  this.downloadManager,
                  tweet,
                  index === 0 ? 'normal' : 'thread',
                  index === 0 ? null : tweets[index - 1].includes.users[0]
                )
              } catch (error) {
                new Notice(
                  'There was a problem processing the downloaded tweet'
                )
                console.error(error)
              }
              return markdown
            })
          )

          const firstTweet = tweets[0]
          this.plugin.currentTweet = firstTweet

          if (
            this.thread &&
            this.plugin.settings.condensedThread &&
            this.plugin.settings.includeLinks
          ) {
            markdownsOrMarksdown.push(
              '',
              '',
              `[Thread link](https://twitter.com/${firstTweet.includes.users[0].username}/status/${firstTweet.data.id})`
            )
          }

          this.plugin.tweetMarkdown = this.plugin.settings.condensedThread
            ? markdownsOrMarksdown.join('\n\n')
            : markdownsOrMarksdown.join('\n\n---\n\n')

          await this.downloadManager
            .finishDownloads()
            .then(results => {
              if (results.length) {
                new Notice('Images downloaded.')
              }
            })
            .catch(error => {
              new Notice('There was an error downloading the images.')
              console.error(error)
            })
          this.close()
        })
      })
  }

  onClose(): void {
    const {contentEl, titleEl} = this
    titleEl.empty()
    contentEl.empty()
    if (this.plugin.tweetMarkdown) {
      this.plugin.tweetComplete = new TweetCompleteModal(
        this.plugin.app,
        this.plugin
      )
      this.plugin.tweetComplete.open()
    }
  }
}
