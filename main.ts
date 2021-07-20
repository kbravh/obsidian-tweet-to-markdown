import { App, Modal, Notice, Plugin, PluginSettingTab, request, Setting } from 'obsidian';

interface TTMSettings {
	bearerToken: string;
  noteLocation: string,
  assetLocation: string,
}

const DEFAULT_SETTINGS: TTMSettings = {
	bearerToken: 'default',
  noteLocation: '.',
  assetLocation: './assets'
}

export default class TTM extends Plugin {
	settings: TTMSettings;

	async onload() {
		console.log('loading ttm');

		await this.loadSettings();

		this.addRibbonIcon('dice', 'Tweet to Markdown', () => {
			new Notice('This is a notice!');
		});

		// this.addCommand({
		// 	id: 'open-sample-modal',
		// 	name: 'Open Sample Modal',
		// 	// callback: () => {
		// 	// 	console.log('Simple Callback');
		// 	// },
		// 	checkCallback: (checking: boolean) => {
		// 		let leaf = this.app.workspace.activeLeaf;
		// 		if (leaf) {
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}
		// 			return true;
		// 		}
		// 		return false;
		// 	}
		// });

		this.addSettingTab(new TTMSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TTMSettingTab extends PluginSettingTab {
	plugin: TTM;

	constructor(app: App, plugin: TTM) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my Tweet to Markdown.'});

		new Setting(containerEl)
			.setName('Bearer Token')
			.setDesc('Twitter v2 bearer token')
			.addText(text => text
				.setPlaceholder('Enter your bearer token')
				.setValue('')
				.onChange(async (value) => {
					this.plugin.settings.bearerToken = value;
					await this.plugin.saveSettings();
				}));
	}
}
