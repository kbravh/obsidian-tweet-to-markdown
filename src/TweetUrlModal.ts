import TTM from "main";
import { App, Modal, Notice, Setting } from "obsidian";

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
        button.onClick(event => {
          console.log(event, this.url)
          const bearerToken = process.env.TWITTER_BEARER_TOKEN || this.plugin.settings.bearerToken || '';
          if (!bearerToken){
            new Notice('Bearer token was not found.')
            return
          }
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
