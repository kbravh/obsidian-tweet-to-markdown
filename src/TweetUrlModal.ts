import TTM from "main";
import { App, Modal, Notice, Setting } from "obsidian";
import { TweetCompleteModal } from "./TweetCompleteModal";
import { getTweet, getTweetID, buildMarkdown } from "./util";

export class TweetUrlModal extends Modal {
  url = '';
  plugin;
  tweetComplete: TweetCompleteModal;
  thread = false;
  constructor(app: App, plugin: TTM, tweetComplete: TweetCompleteModal) {
    super(app);
    this.plugin = plugin;
    this.tweetComplete = tweetComplete;
  }

  onOpen() {
    let {contentEl, titleEl} = this;
    titleEl.setText('Download Tweet');

    new Setting(contentEl)
      .setName('Tweet URL')
      .setDesc('Enter the URL of the tweet to download.')
      .addText(input => {
        input
          .setValue(this.url)
          .onChange(value => this.url = value)
          .setPlaceholder('Tweet URL')
      })

    new Setting(contentEl)
      .setName('Tweet thread')
      .setDesc('Download a tweet thread. (Put the link to the LAST tweet in the thread).')
      .addToggle(toggle => {
        toggle
          .setValue(false)
          .onChange(value => {
            this.thread = value;
          })
      })

    new Setting(contentEl)
      .addButton(button => {
        button.setButtonText('Download Tweet')
        button.onClick(async event => {
          // error checking for kickoff
          const bearerToken = process.env.TWITTER_BEARER_TOKEN || this.plugin.settings.bearerToken || '';
          if (!this.url) {
            new Notice('No tweet link provided.')
            return
          }
          if (!bearerToken){
            new Notice('Bearer token was not found.')
            return
          }

          this.plugin.bearerToken = bearerToken;

          // fetch tweet
          const id = getTweetID(this.url);
          this.plugin.currentTweet = await getTweet(id, bearerToken);
          this.plugin.currentTweetMarkdown = '';

          // special handling for threads
          if (this.thread) {
            // check if this is the head tweet
            while (this.plugin.currentTweet.data.conversation_id !== this.plugin.currentTweet.data.id) {
              let markdown = await buildMarkdown(this.app, this.plugin, this.plugin.currentTweet, 'thread');
              this.plugin.currentTweetMarkdown = markdown + this.plugin.currentTweetMarkdown;
              // load in parent tweet
              let [parent_tweet] = this.plugin.currentTweet.data.referenced_tweets.filter((ref_tweet) => ref_tweet.type === 'replied_to');
              this.plugin.currentTweet = await getTweet(parent_tweet.id, bearerToken);
            }
          }

          const markdown = await buildMarkdown(this.app, this.plugin, this.plugin.currentTweet);
          this.plugin.currentTweetMarkdown = markdown + this.plugin.currentTweetMarkdown;

          this.close()
        })
      })
  }

  onClose() {
    let {contentEl, titleEl} = this;
    titleEl.empty();
    contentEl.empty();
    if (!!this.plugin.currentTweetMarkdown) {
      this.tweetComplete.open();
    }
  }
}
