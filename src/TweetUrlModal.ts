import TTM from "main";
import { App, Modal, Notice, Setting, TAbstractFile } from "obsidian";
import { getTweet, getTweetID, buildMarkdown, createFilename } from "./util";

export class TweetUrlModal extends Modal {
  url = '';
  plugin;
  constructor(app: App, plugin: TTM) {
    super(app);
    this.plugin = plugin;
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
          const tweet = await getTweet(id, bearerToken);

          // create markdown
          let final = '';
          const markdown = await buildMarkdown(tweet);
          final = markdown + final;

          //write tweet
          const filename = createFilename(tweet, this.plugin.settings.filename)

          // see if file already exists
          let file: TAbstractFile;
          try {
            file = this.app.vault.getAbstractFileByPath(`${this.plugin.settings.noteLocation}/${filename}`);
          }
          catch (error) {}
          if (file) {
            new Notice(`The file ${filename} already exists`);
            return;
          }

          // create the directory
          try {
            this.app.vault.createFolder(this.plugin.settings.noteLocation);
          } catch (error) {}

          // write the note to file
          this.app.vault.create(`${this.plugin.settings.noteLocation}/${filename}`, final);
          new Notice(`${filename} created.`);
          this.close()
        })
      })
  }

  onClose() {
    let {contentEl, titleEl} = this;
    titleEl.empty();
    contentEl.empty();
  }
}
