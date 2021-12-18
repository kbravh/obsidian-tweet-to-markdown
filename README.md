<br />
<p align="center">
  <a href="https://github.com/kbravh/obsidian-tweet-to-markdown">
    <img src="https://raw.githubusercontent.com/kbravh/obsidian-tweet-to-markdown/main/images/obsidian-ttm-logo.svg" alt="Logo" height=200>
  </a>

  <h3 align="center">Tweet to Markdown</h3>

  <p align="center">
    An Obsidian plugin to quickly save tweets as Markdown.
    <br />
    <br />
    <a href="https://github.com/kbravh/obsidian-tweet-to-markdown/issues">Report a Bug</a>
    ·
    <a href="https://github.com/kbravh/obsidian-tweet-to-markdown/issues">Request a Feature</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

This plugin allows you to quickly save a tweet in Markdown format. It is built on the new Twitter v2 API.

## Installing

Find this plugin in the listing of community plugins in Obsidian and add it to your application.

Or, if you'd like to install it manually, clone this repository to the `.obsidian/plugins/` directory in your vault, navigate to your newly cloned folder, run `npm i` or `yarn` to install dependencies, and run `npm run build` or `yarn build` to compile the plugin.

<!-- USAGE EXAMPLES -->

## Usage

**Heads up! 📢:** As of right now, you need to set up a Twitter bearer token to use this plugin. However, I'm working on another option so that you won't have to go through that hassle. Keep your eyes peeled for version 2.0.0 😎

### Bearer token
To use this tool, you'll need to set up an application and get a bearer token on the [Twitter developer dashboard](https://developer.twitter.com/en/portal/dashboard). For a guide on doing so, see [Getting a bearer token](https://github.com/kbravh/obsidian-tweet-to-markdown/blob/main/BearerTokenGuide.md). Once you have the bearer token, you can paste it into the bearer token field on the Tweet to Markdown settings page. If you'd rather protect the token a bit more, you can store it in the environment variable `TWITTER_BEARER_TOKEN`.

Nota bene: On Unix machines, make sure to set this in your profile file (such as `~/.bash_profile`) so that it will be available to Obsidian.

### Downloading a tweet

Either click the Twitter logo in your sidebar or run the command `Download Tweet from URL` from the command palette. Then, just paste in the link to a tweet and click download.

To download a tweet thread, paste the link to the **LAST** tweet in the thread, and toggle the Thread switch.

![The modal to download a new tweet.](https://raw.githubusercontent.com/kbravh/obsidian-tweet-to-markdown/main/images/tweet_url_modal.png)

Once the tweet is downloaded, you'll be presented a window to set the name of the file that will be created. You can use the variables `[[handle]]`, `[[name]]`, `[[text]]`, and `[[id]]` when naming your file, which will be automatically replaced according to the following chart. The file extension `.md` will be added automatically.

| Variable | Replacement |
|:---:|---|
|[[handle]]|The user's handle (the part that follows the @ symbol)|
|[[name]]|The user's name|
|[[id]]|The unique ID assigned to the tweet|
|[[text]]|The entire text of the tweet|

![The modal to name a downloaded tweet.](https://raw.githubusercontent.com/kbravh/obsidian-tweet-to-markdown/main/images/tweet_complete_modal.png)

The tweet will be saved to a Markdown file in the root of your vault, or in the directory specified in your settings. Here's how the tweet will look:

![The rendered Markdown file](https://raw.githubusercontent.com/kbravh/obsidian-tweet-to-markdown/main/images/markdown_screenshot.png)

Any attached images, polls, and links will also be linked and displayed in the file.

## Options

On the Tweet to Markdown settings page in Obsidian, you can customize the way the plugin works to better match your vault structure and workflow.

### Custom File Name

Tweets are, by default, saved with the filename `[[handle]] - [[id]].md`. You can instead enter your own format in the **Filename** field using the variables `[[name]]`, `[[handle]]`, `[[text]]`, and `[[id]]` in your filename,  which will be automatically replaced according to the following chart. The file extension `.md` will be added automatically.

| Variable | Replacement |
|:---:|---|
|[[handle]]|The user's handle (the part that follows the @ symbol)|
|[[name]]|The user's name|
|[[id]]|The unique ID assigned to the tweet|
|[[text]]|The entire text of the tweet (truncated to fit OS filename length restrictions)|

### Custom File Path

To save the tweet to a place other than the root of your vault, type a new path in the **Note Location** field. If this path doesn't exist, it will be recursively created.

### Save Images Locally

Want to really capture the entire tweet locally? You can flip the **Download images** switch to download all the tweet images as well, instead of just linking to the images on the web. If the tweet is ever deleted or Twitter is unavailable, you'll still have your note.

Tweet images will be automatically saved to the directory `tweet-assets/`. If you'd like to save the assets to a custom directory, type that directory in the **Image location** field.

Nota bene: Unfortunately, there is currently not a way to retrieve gifs or videos from tweets using the v2 API.

## Note customization
There are some options to customize the output of the note.

### Author profile pictures
By default, the tweet author's profile picture will be included with the downloaded tweet. To exclude it, disable the **Include profile pictures** in the plugin settings.

### Date format
To customize the format that the date is saved when downloading a tweet, you can provide a format string in the plugin settings. These format strings can be found in the [Moment.js docs](https://momentjs.com/docs/#/displaying/format/). By default, the format is `LLL`, which produces a date like `September 4, 1986 8:30 PM`.

## Pasting links
As of version 1.3.0, you can paste a Twitter link into any file and have it automatically converted to the tweet and embedded in your note. ✨

![Demo of tweet link pasting](https://raw.githubusercontent.com/kbravh/obsidian-tweet-to-markdown/main/images/link_paste_demo.gif)

This setting can be enabled in the plugin settings panel as **Download Tweet on paste**. Also in the settings, you can choose whether the tweet should be embedded directly as text in the current note, or if it should be linked as an Obsidian embed (`![[note title]]`).

**Nota bene 📢:** If you are also using the [Auto Link Title plugin](obsidian://show-plugin?id=obsidian-auto-link-title), you may see that it picks up the pasted link first before we have a chance to process it. Unfortunately there is no way to set the order that the plugins run. A workaround is to add the letter `t` to the front of any Twitter link you want this plugin to pick up before you paste it, like this: `thttps://twitter.com/...`. This will cause Auto Link Title to ignore it so that we can process it instead. You _must_ add the `t` to the link before you paste it; you cannot type the `t` in your document then paste, because Auto Link Title will still grab it.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

This project is licensed under the MIT License - see the [ `LICENSE` ](https://github.com/kbravh/obsidian-tweet-to-markdown/blob/main/LICENSE) file for details

<!-- CONTACT -->

## Contact

Karey Higuera - [@kbravh](https://twitter.com/kbravh) - karey.higuera@gmail.com

Project Link: [https://github.com/kbravh/obsidian-tweet-to-markdown](https://github.com/kbravh/tweet-to-markdown)
