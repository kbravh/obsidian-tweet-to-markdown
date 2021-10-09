import TTM from "main";
import { App, Modal, Notice, Setting } from "obsidian";
import { TweetCompleteModal } from "./TweetCompleteModal";
import { getTweet, getTweetID, buildMarkdown } from "./util";

export class TweetUrlModal extends Modal {
  url = '';
  plugin;
  tweetComplete: TweetCompleteModal;
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
        input.setValue(this.url)
        input.onChange(value => this.url = value)
        .setPlaceholder('Tweet URL')
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

          // fetch tweet
          const id = getTweetID(this.url);
          this.plugin.currentTweet = await getTweet(id, bearerToken);

          // create markdown
          this.plugin.currentTweetMarkdown = '';
          const markdown = await buildMarkdown(this.plugin.settings, this.plugin.currentTweet);
          this.plugin.currentTweetMarkdown = markdown + this.plugin.currentTweetMarkdown;

          this.close()
        })
      })
  }

  onClose() {
    let {contentEl, titleEl} = this;
    titleEl.empty();
    contentEl.empty();
    this.tweetComplete.open();
  }
}
