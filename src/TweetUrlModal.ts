import { App, Modal, Setting } from "obsidian";

export class TweetUrlModal extends Modal {
  constructor(app: App, private url: string) {
    super(app);
    this.url = '';
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
      .setName('Download tweet')
      .addButton(button => {
        button.onClick(event => {
          console.log(event, this.url)
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
