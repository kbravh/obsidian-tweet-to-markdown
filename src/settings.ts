import { PluginSettingTab, App, Setting } from "obsidian";
import TTM from "main";

export interface TTMSettings {
	bearerToken: string | null;
  noteLocation: string | null,
  downloadAssets: boolean,
  assetLocation: string | null,
  filename: string | null
}

export const DEFAULT_SETTINGS: TTMSettings = {
	bearerToken: null,
  noteLocation: null,
  downloadAssets: false,
  assetLocation: null,
  filename: null
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
      .setDesc('Enter your V2 Twitter bearer token, or store it in the environment variable TWITTER_BEARER_TOKEN.')
			.addText(text => text
				.setPlaceholder('Twitter v2 bearer token')
				.setValue(this.plugin.settings.bearerToken)
				.onChange(async value => {
					this.plugin.settings.bearerToken = value;
					await this.plugin.saveSettings();
				}));

      new Setting(containerEl)
        .setName('Note Location')
        .setDesc('Where to store the created notes. Defaults to the root of the vault.')
        .addText(text => text
          .setPlaceholder('tweets/')
          .setValue(this.plugin.settings.noteLocation)
          .onChange(async value => {
            this.plugin.settings.noteLocation = value;
            await this.plugin.saveSettings();
          }))

      new Setting(containerEl)
        .setName('Download images')
        .setDesc('Whether to link images or download them to your vault.')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.downloadAssets)
          .onChange(async value => {
            this.plugin.settings.downloadAssets = value;
            await this.plugin.saveSettings();
          }))

      new Setting(containerEl)
        .setName('Image Location')
        .setDesc('Where to store the downloaded images. Defaults to `assets/`.')
        .addText(text => text
          .setPlaceholder('assets/')
          .setValue(this.plugin.settings.assetLocation)
          .onChange(async value => {
            this.plugin.settings.assetLocation = value;
            await this.plugin.saveSettings();
          }))

      new Setting(containerEl)
        .setName('Filename')
        .setDesc('The name to give the saved tweet file. You can use the placeholders [[handle]], [[name]], and [[id]]. Defaults to "[[handle]] - [[id]]"')
        .addText(text => text
          .setPlaceholder('[[handle]] - [[id]]')
          .setValue(this.plugin.settings.filename)
          .onChange(async value => {
            this.plugin.settings.filename = value;
            await this.plugin.saveSettings();
          }))
	}
}
