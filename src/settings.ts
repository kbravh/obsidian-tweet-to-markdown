import {App, moment, Platform, PluginSettingTab, Setting} from 'obsidian'
import TTM from 'main'

export interface TTMSettings {
  bearerToken: string | null
  noteLocation: string | null
  downloadAssets: boolean
  assetLocation: string | null
  filename: string | null
  tweetLinkFetch: boolean
  embedMethod: 'text' | 'obsidian'
  avatars: boolean
  slimmedDown: boolean
  dateFormat: string
  dateLocale: string
}

export const DEFAULT_SETTINGS: TTMSettings = {
  bearerToken: null,
  noteLocation: '',
  downloadAssets: false,
  assetLocation: '',
  filename: null,
  tweetLinkFetch: false,
  embedMethod: 'obsidian',
  avatars: true,
  slimmedDown: false,
  dateFormat: 'LLL',
  dateLocale: 'en',
}

export class TTMSettingTab extends PluginSettingTab {
  plugin: TTM
  locales = moment
    .locales()
    .reduce((obj, locale) => ({...obj, [locale]: locale}), {})

  constructor(app: App, plugin: TTM) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const {containerEl} = this
    containerEl.empty()
    containerEl.createEl('h2', {text: 'Settings for Tweet to Markdown'})

    new Setting(containerEl)
      .setName('API key or bearer token')
      .setDesc(
        Platform.isMobileApp
          ? 'Enter your API key or Twitter bearer token.'
          : 'Enter your API key or Twitter bearer token, or store it in the environment variable TTM_API_KEY or TWITTER_BEARER_TOKEN.'
      )
      .addText(text =>
        text
          .setPlaceholder('Twitter v2 bearer token')
          .setValue(this.plugin.settings.bearerToken)
          .onChange(async value => {
            this.plugin.settings.bearerToken = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Note Location')
      .setDesc(
        'Where to store the created notes. Defaults to the root of the vault.'
      )
      .addText(text =>
        text
          .setPlaceholder('.')
          .setValue(this.plugin.settings.noteLocation)
          .onChange(async value => {
            this.plugin.settings.noteLocation = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Download images')
      .setDesc('Whether to link images or download them to your vault.')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.downloadAssets)
          .onChange(async value => {
            this.plugin.settings.downloadAssets = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Image Location')
      .setDesc('Where to store the downloaded images. Defaults to `assets/`.')
      .addText(text =>
        text
          .setPlaceholder('assets/')
          .setValue(this.plugin.settings.assetLocation)
          .onChange(async value => {
            this.plugin.settings.assetLocation = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Filename')
      .setDesc(
        'The name to give the saved tweet file. You can use the placeholders [[handle]], [[name]], [[text]] and [[id]]. Defaults to "[[handle]] - [[id]]"'
      )
      .addText(text =>
        text
          .setPlaceholder('[[handle]] - [[id]]')
          .setValue(this.plugin.settings.filename)
          .onChange(async value => {
            this.plugin.settings.filename = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Download Tweet on paste')
      .setDesc(
        'Automatically download and embed a tweet when pasting a twitter link.'
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.tweetLinkFetch)
          .onChange(async value => {
            this.plugin.settings.tweetLinkFetch = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Pasted Tweet embed method')
      .setDesc(
        'Determines if a pasted tweet will be embedded directly into the file or linked with an Obsidian embed.'
      )
      .addDropdown(dropdown =>
        dropdown
          .addOptions({
            text: 'Direct text embed',
            obsidian: 'Obsidian embed',
          })
          .setValue(this.plugin.settings.embedMethod)
          .onChange(async (value: 'text' | 'obsidian') => {
            this.plugin.settings.embedMethod = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Include profile pictures')
      .setDesc(
        'Whether to include the profile image of the tweet author in the saved tweet.'
      )
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.avatars).onChange(async value => {
          this.plugin.settings.avatars = value
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Slimmed down tweets')
      .setDesc(
        'Only include the author information and the tweet text, no links or images.'
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.slimmedDown)
          .onChange(async value => {
            this.plugin.settings.slimmedDown = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Date Format')
      .setDesc('The format to display the tweet timestamp.')
      .addMomentFormat(format =>
        format
          .setDefaultFormat(this.plugin.settings.dateFormat)
          .setValue(this.plugin.settings.dateFormat)
          .onChange(async value => {
            this.plugin.settings.dateFormat =
              value || DEFAULT_SETTINGS.dateFormat
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Date locale')
      .setDesc('The locale to apply to the date format')
      .addDropdown(dropdown =>
        dropdown
          .addOptions(this.locales)
          .setValue(this.plugin.settings.dateLocale)
          .onChange(async value => {
            this.plugin.settings.dateLocale = value
            await this.plugin.saveSettings()
          })
      )
  }
}
