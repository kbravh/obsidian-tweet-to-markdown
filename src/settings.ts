import { PluginSettingTab, App, Setting } from "obsidian";
import TTM from "main";

export interface TTMSettings {
	bearerToken: string;
  noteLocation: string,
  downloadAssets: boolean,
  assetLocation: string,
  filename: string
}

export const DEFAULT_SETTINGS: TTMSettings = {
	bearerToken: 'default',
  noteLocation: '.',
  downloadAssets: false,
  assetLocation: './assets',
  filename: '[[handle]] - [[id]]'
}

export class TTMSettingTab extends PluginSettingTab {
	plugin: TTM;

	constructor(app: App, plugin: TTM) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Tweet to Markdown'});

		new Setting(containerEl)
			.setName('Bearer Token')
			.setDesc('Twitter v2 bearer token')
			.addText(text => text
				.setPlaceholder('Enter your bearer token from https://developer.twitter.com/en/portal/dashboard')
				.setValue('')
				.onChange(async value => {
					this.plugin.settings.bearerToken = value;
					await this.plugin.saveSettings();
				}));

      new Setting(containerEl)
        .setName('Note Location')
        .setDesc('Where to store the created notes. Defaults to the root of the vault. Relative.')
        .addText(text => text
          .setPlaceholder('.')
          .setValue('')
          .onChange(async value => {
            this.plugin.settings.noteLocation = value;
            await this.plugin.saveSettings();
          }))

      new Setting(containerEl)
        .setName('Download images')
        .setDesc('Whether to link images or download them to your vault.')
        .addToggle(toggle => toggle
          .setValue(false)
          .onChange(async value => {
            this.plugin.settings.downloadAssets = value;
            await this.plugin.saveSettings();
          }))

      new Setting(containerEl)
        .setName('Asset Location')
        .setDesc('Where to store the downloaded assets. Defaults to `assets/`. Relative to vault root.')
        .addText(text => text
          .setPlaceholder('assets/')
          .setValue('')
          // .setDisabled(this.plugin.settings.downloadAssets) // TODO - this does not update
          .onChange(async value => {
            this.plugin.settings.assetLocation = value;
            await this.plugin.saveSettings();
          }))

      new Setting(containerEl)
        .setName('Filename')
        .setDesc('The name to give the saved tweet file. You can use the placeholders [[handle]], [[name]], and [[id]]. Defaults to "[[handle]] - [[id]]')
        .addText(text => text
          .setPlaceholder('[[handle]] - [[id]]')
          .setValue('')
          .onChange(async value => {
            this.plugin.settings.filename = value;
            await this.plugin.saveSettings();
          }))
	}
}
