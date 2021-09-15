import { Modal, App } from "obsidian";

export class TweetUrlModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let {contentEl, titleEl} = this;
    titleEl.setText('Download Tweet');
    contentEl.setText('Modal!!');
  }

  onClose() {
    let {contentEl, titleEl} = this;
    titleEl.empty();
    contentEl.empty();
  }
}
