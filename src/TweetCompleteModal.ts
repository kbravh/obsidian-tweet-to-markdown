import TTM from "main";
import { App, Modal, Notice, Setting } from "obsidian";
import { createFilename, downloadImages, doesFileExist, cleanFilepath } from "./util";

export class TweetCompleteModal extends Modal {
  plugin: TTM;
  constructor(app: App, plugin: TTM) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    let {contentEl, titleEl} = this;
    titleEl.setText('Name tweet file');

    let filename = createFilename(this.plugin.currentTweet, this.plugin.settings.filename)

    new Setting(contentEl)
      .setName('Filename')
      .setDesc('Set the name of the file. You can use the placeholders [[handle]], [[name]], and [[id]].')
      .addText(input => {
        input.setValue(filename)
        input.onChange(value => {
          filename = createFilename(this.plugin.currentTweet, value)
        })
        .setPlaceholder('[[handle]] - [[id]]')
      })

    new Setting(contentEl)
      .addButton(button => {
        button.setButtonText('Save Tweet')
        button.onClick(async event => {
          // see if file already exists
          const file = doesFileExist(this.app, `${this.plugin.settings.noteLocation}/${filename}`);
          if (file) {
            new Notice(`The file ${filename} already exists`);
            return;
          }

          // create the directory
          this.app.vault.createFolder(this.plugin.settings.noteLocation).catch(_ => {});

          // write the note to file
          this.app.vault.create(cleanFilepath(`${this.plugin.settings.noteLocation}/${filename}`), this.plugin.currentTweetMarkdown);

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
