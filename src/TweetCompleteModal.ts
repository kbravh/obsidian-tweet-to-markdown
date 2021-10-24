import {App, Modal, Notice, Setting} from 'obsidian'
import {cleanFilepath, createFilename, doesFileExist} from './util'
import TTM from 'main'

export class TweetCompleteModal extends Modal {
  plugin: TTM
  constructor(app: App, plugin: TTM) {
    super(app)
    this.plugin = plugin
  }

  onOpen(): void {
    const {contentEl, titleEl} = this
    titleEl.setText('Name tweet file')

    let filename = createFilename(
      this.plugin.currentTweet,
      this.plugin.settings.filename
    )

    new Setting(contentEl)
      .setName('Filename')
      .setDesc(
        'Set the name of the file. You can use the placeholders [[handle]], [[name]], and [[id]].'
      )
      .addText(input => {
        input.setValue(filename)
        input
          .onChange(value => {
            filename = createFilename(this.plugin.currentTweet, value)
          })
          .setPlaceholder('[[handle]] - [[id]]')
      })

    new Setting(contentEl).addButton(button => {
      button.setButtonText('Save Tweet')
      button.onClick(async () => {
        // see if file already exists
        const file = doesFileExist(
          this.app,
          `${this.plugin.settings.noteLocation}/${filename}`
        )
        if (file) {
          new Notice(`The file ${filename} already exists`)
          return
        }

        // create the directory
        await this.app.vault
          .createFolder(this.plugin.settings.noteLocation)
          .catch(() => {})

        // write the note to file
        await this.app.vault.create(
          cleanFilepath(`${this.plugin.settings.noteLocation}/${filename}`),
          this.plugin.currentTweetMarkdown
        )

        new Notice(`${filename} created.`)
        this.close()
      })
    })
  }

  onClose(): void {
    const {contentEl, titleEl} = this
    titleEl.empty()
    contentEl.empty()

    // clean up
    this.plugin.currentTweet = null
    this.plugin.currentTweetMarkdown = null
  }
}
