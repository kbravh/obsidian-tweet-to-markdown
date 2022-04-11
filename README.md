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

Find this plugin in the listing of community plugins in Obsidian and add it to your application. You can search for "Tweet to Markdown", or copy and paste the following link in your browser: `obsidian://show-plugin?id=obsidian-tweet-to-markdown`.

Or, if you'd like to install it manually, clone this repository to the `.obsidian/plugins/` directory in your vault, navigate to your newly cloned folder, run `npm i` or `yarn` to install dependencies, and run `npm run build` or `yarn build` to compile the plugin.

<!-- USAGE EXAMPLES -->

## Setup

To use this tool, you have two options:
- Sign up for a free API key from https://ttm.kbravh.dev (new in v2.0.0)
- Sign up for a bearer token through the Twitter Developer dashboard

Getting a free API key from https://ttm.kbravh.dev is the easiest method of using this plugin, as you won't have to go through Twitter's developer application process. Their application is tedious, and they don't always approve requests. However, you are more than welcome to follow the guide below to retrieve your own bearer token from Twitter. This will give you the most control, freedom, and security over your usage.

### Free TTM API key
You can sign up for a free API key at https://ttm.kbravh.dev by signing in with either your GitHub or Twitter account and heading to your account page. Once you sign in and retrieve your API key from your account page, copy and paste it into the API key/bearer token field on the Tweet to Markdown settings page. If you'd rather protect the token a bit more, you can store it in the environment variable `TTM_API_KEY`.

### Twitter Developer bearer token
To get a bearer token from Twitter, you'll need to set up an application on the [Twitter developer dashboard](https://developer.twitter.com/en/portal/dashboard). For a guide on doing so, see [Getting a bearer token](https://github.com/kbravh/obsidian-tweet-to-markdown/blob/main/BearerTokenGuide.md). Once you have the bearer token, you can paste it into the bearer token field on the Tweet to Markdown settings page. If you'd rather protect the token a bit more, you can store it in the environment variable `TWITTER_BEARER_TOKEN`.

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

Tweet images will be automatically saved to the directory `assets/`. If you'd like to save the assets to a custom directory, type that directory in the **Image location** field.

Nota bene: Unfortunately, there is currently not a way to retrieve gifs or videos from tweets using the v2 API.

## Note customization
There are some options to customize the output of the note.

### Frontmatter
By default, a frontmatter block will be included when the tweet is downloaded. The frontmatter will display:
- author
- handle
- source (the original tweet link)
- date
- likes
- retweets
- replies

You can toggle this frontmatter block off to not include it when downloading tweets.

### Author profile pictures
By default, the tweet author's profile picture will be included with the downloaded tweet. To exclude it, disable the **Include profile pictures** in the plugin settings.

### Include images
If you'd like a slimmed down tweet, you can disable this option. It will remove all image embeds from the incoming tweets (this does not affect the author profile pictures).

### Include links
Disabling this option will not hyperlink any mentions, hashtags, etc. Any links that were originally in the tweet will still be present.

### Include date
By default, the date of the tweet will be included based on the format and locale defined below. To remove the date entirely, toggle this feature.

### Date format
To customize the format that the date is saved when downloading a tweet, you can provide a format string in the plugin settings. These format strings can be found in the [Moment.js docs](https://momentjs.com/docs/#/displaying/format/). You can also set your locale, which defaults to `en`. By default the format is `LLL`, which produces a date like `September 4, 1986 8:30 PM` with the `en` locale.

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
