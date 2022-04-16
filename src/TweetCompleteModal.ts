import {App, Modal, Notice, Setting} from 'obsidian'
import {createFilename, doesFileExist, sanitizeFilename} from './util'
import TTM from 'main'
import {TweetCompleteActions} from './types/plugin'

export class TweetCompleteModal extends Modal {
  plugin: TTM
  constructor(app: App, plugin: TTM) {
    super(app)
    this.plugin = plugin
  }

  onOpen(): void {
    const {contentEl, titleEl} = this
    titleEl.setText('Name tweet file')

    let filename = sanitizeFilename(
      createFilename(this.plugin.currentTweet, this.plugin.settings.filename),
      'decode'
    )

    new Setting(contentEl)
      .setName('Filename')
      .setDesc(
        'Set the name of the file. You can use the placeholders [[handle]], [[name]], [[text]], and [[id]].'
      )
      .addText(input => {
        input.setValue(filename)
        input
          .onChange(value => {
            filename = sanitizeFilename(
              createFilename(this.plugin.currentTweet, value),
              'decode'
            )
          })
          .setPlaceholder('[[handle]] - [[id]]')
      })

    new Setting(contentEl).addButton(button => {
      button.setButtonText('Save Tweet')
      button.onClick(async () => {
        // see if file already exists
        const location = sanitizeFilename(
          this.plugin.settings.noteLocation,
          'decode',
          'directory'
        )
        const file = doesFileExist(this.app, `${location}/${filename}`)
        if (file) {
          new Notice(`The file ${filename} already exists`)
          return
        }

        if (location) {
          // create the directory
          const doesFolderExist = await this.app.vault.adapter.exists(location)
          if (!doesFolderExist) {
            await this.app.vault.createFolder(location).catch(error => {
              new Notice('Error creating tweet directory.')
              console.error(
                'There was an error creating the tweet directory.',
                error
              )
            })
          }
        }

        // clean up excessive newlines
        this.plugin.tweetMarkdown = this.plugin.tweetMarkdown.replace(
          /\n{2,}/g,
          '\n\n'
        )

        // write the note to file
        const newFile = await this.app.vault.create(
          `${location}/${filename}`,
          this.plugin.tweetMarkdown
        )

        new Notice(`${filename} created.`)

        switch (this.plugin.settings.tweetCompleteAction) {
          case TweetCompleteActions.activeWindow: {
            const leaf = this.app.workspace.activeLeaf
            leaf.openFile(newFile)
            break
          }
          case TweetCompleteActions.newTab: {
            const leaf = this.app.workspace.activeLeaf
            const state = leaf.getViewState()
            if (state.type === 'empty') {
              leaf.openFile(newFile)
            } else {
              const newLeaf = this.app.workspace.createLeafBySplit(leaf)
              newLeaf.openFile(newFile)
            }
            break
          }
          case TweetCompleteActions.never:
            break
          default:
            break
        }
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
    this.plugin.tweetMarkdown = ''
  }
}
