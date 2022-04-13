// Credit for this goes to https://github.com/SilentVoid13/Templater

import {TAbstractFile, TFolder} from 'obsidian'
import {TextInputSuggest} from './suggest'

export class FolderSuggest extends TextInputSuggest<TFolder> {
  getSuggestions(inputStr: string): TFolder[] {
    const abstractFiles = this.app.vault.getAllLoadedFiles()
    const lowerCaseInputStr = inputStr.toLowerCase()

    return abstractFiles.filter(
      (folder: TAbstractFile) =>
        folder instanceof TFolder &&
        folder.path.toLowerCase().contains(lowerCaseInputStr)
    ) as TFolder[]
  }

  renderSuggestion(file: TFolder, el: HTMLElement): void {
    el.setText(file.path)
  }

  selectSuggestion(file: TFolder): void {
    this.inputEl.value = file.path
    this.inputEl.trigger('input')
    this.close()
  }
}
