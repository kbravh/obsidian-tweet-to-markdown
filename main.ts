import {addIcon, Plugin} from 'obsidian'
import {DEFAULT_SETTINGS, TTMSettings, TTMSettingTab} from 'src/settings'
import {Tweet} from 'src/models'
import {TweetCompleteModal} from 'src/TweetCompleteModal'
import {TweetUrlModal} from 'src/TweetUrlModal'

export default class TTM extends Plugin {
  settings: TTMSettings
  currentTweet: Tweet
  currentTweetMarkdown: string
  bearerToken: string

  async onload(): Promise<void> {
    console.info('loading ttm')

    addIcon(
      'twitter',
      '<path fill="currentColor" stroke="currentColor" d="M50.583 35.174c1.361-.402 3.076-.258 4.5-.44a58.326 58.326 0 007.834-1.572c8.806-2.383 17.139-6.943 23.833-13.147 2.062-1.91 4.303-3.939 5.917-6.257h.083c3.816 7.251 3.671 15.886-1.344 22.583-1.275 1.702-3.033 3.74-4.99 4.667v.083c3.307-.027 6.312-1.211 9.25-2.583 0 7.586-4.087 14.845-10.916 18.354-1.642.844-3.549 1.747-5.417 1.896v.083c2.866.807 6.173 1.05 9.084.333-.173 1.982-1.734 4.281-2.886 5.834-3.764 5.07-9.756 8.333-16.114 8.333 1.602 1.471 3.6 2.649 5.5 3.692a41.641 41.641 0 0017.166 5.05c2.5.172 4.93-.152 7.417-.159v.084c-2.239 1.191-4.352 2.578-6.667 3.64-4.485 2.06-9.222 3.599-14.083 4.475-3.516.634-6.939.718-10.5.718-4.04 0-7.936-.12-11.917-.9-14.826-2.908-27.945-11.673-36.221-24.35-4.66-7.138-7.832-15.174-9.242-23.583-.465-2.772-.588-5.543-.78-8.334-.066-.976.374-2.43.027-3.33-.168-.432-.769-.727-1.117-1.003a50.039 50.039 0 01-2.5-2.098c-2.432-2.2-4.773-4.77-6.5-7.569l4.167 1.524 7.5 1.643v-.083c-1.046-.452-1.967-1.27-2.834-1.994-2.753-2.298-5.13-5.684-6.083-9.173 1.223.36 2.427 1.252 3.583 1.812 1.972.954 4.064 1.691 6.167 2.295.88.253 1.994.713 2.917.69.46-.012.843-.552 1.166-.833.89-.77 1.769-1.517 2.75-2.171 2.52-1.68 5.43-2.732 8.417-3.174 9.758-1.444 19.486 4.708 22.414 14.13.706 2.271 1.075 4.79.912 7.168-.085 1.234-.393 2.441-.493 3.666z"/>'
    )

    await this.loadSettings()

    // add twitter icon with a delay so it won't end up first
    this.addRibbonIcon('twitter', 'Tweet to Markdown', () => {
      const tweetComplete = new TweetCompleteModal(this.app, this)
      new TweetUrlModal(this.app, this, tweetComplete).open()
    })

    this.addCommand({
      id: 'open-tweet-url-modal',
      name: 'Download Tweet from URL',
      callback: () => {
        const tweetComplete = new TweetCompleteModal(this.app, this)
        new TweetUrlModal(this.app, this, tweetComplete).open()
      }
    })

    this.addSettingTab(new TTMSettingTab(this.app, this))
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
