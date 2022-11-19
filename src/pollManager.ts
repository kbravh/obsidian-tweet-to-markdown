import {App, Notice, TFile, parseFrontMatterEntry} from 'obsidian'
import TTM from 'main'
import {createDownloadManager, DownloadManager} from './downloadManager'
import {buildMarkdown, getBearerToken, getUser, getTimeline} from './util'
import {createFilename, doesFileExist, sanitizeFilename} from './util'
import type {Tweet, User} from './types/tweet'
import { TweetCompleteActions } from './types/plugin'


export const createPollManager = (app: App, plugin: TTM): PollManager => {
  const pollRun = (): void => {
    if (!navigator.onLine) {
      new Notice('Polling for new tweets skipped because you appear to be offline.')
      return
    }

    const bearerToken = getBearerToken(plugin)
    if (!bearerToken) {
      new Notice('Polling for new tweets skipped because bearer token was not found.')
      return
    }

    const handles:string[] = plugin.settings.pollHandles.replace(/\s|@/g, '').split(",")
    var downloadManager = createDownloadManager()
    plugin.bearerToken = bearerToken
    
    handles.forEach(async handle => {

      let user
      try {
        //Note the term for a "handle" in the Twitter API is "username"
        user = await getUser(handle, bearerToken);
      } catch (error) {
        new Notice(error.message)
        return
      }

      //Hella hacky way to make use of the existing createFilename interface
      const dummyTweet:Tweet = {
        includes: {users: [user]},
        data: {id: "", text: "", created_at: "", author_id: "",
               public_metrics: {retweet_count: 0, reply_count: 0, like_count: 0, quote_count: 0}}
      }

      let fname = createFilename(
        dummyTweet,
        plugin.settings.pollFilename,
        { locale: plugin.settings.dateLocale, format: plugin.settings.dateFormat })
      
      const fpath = createFilename(
        dummyTweet,
        plugin.settings.noteLocation ? plugin.settings.noteLocation : "./", //fix broken location default
        { locale: plugin.settings.dateLocale, format: plugin.settings.dateFormat },
        'directory')
      
      if (!fname || !fpath) {
        new Notice('Failed to create filepath for timeline.')
        return
      }
      
      if (! await app.vault.adapter.exists(fpath)) {
        await app.vault.createFolder(fpath).catch(error => {
          new Notice('Error creating tweet directory.')
          console.error(
            'There was an error creating the tweet directory.',
            error
          )
          return
        })
      }
      
      //Seems getAbstractFileByPath doesn't handle "./" path. Strip it out if necessary here.
      let abstractFile = app.vault.getAbstractFileByPath(fpath == "./" ? fname : `${fpath}/${fname}`)
      let file: TFile
      let since: Date
      if(abstractFile && abstractFile instanceof TFile) {
        file = abstractFile
        if(file)
        {
          let metadata = app.metadataCache.getFileCache(file)
          //If the parse fails, date will be the unix epoch, which is as good as undefined.
          since = new Date(parseFrontMatterEntry(metadata.frontmatter, "fetched"))
        }
      }
      
      let tweets: Tweet[]
      new Notice(`Polling for new Tweets from ${handle}...`)

      try {
        tweets = await getTimeline(user.id, since, bearerToken)
      } catch (error) {
        new Notice(error.message)
        return
      }

      plugin.tweetMarkdown = ''

      const markdowns = await Promise.all(
        tweets.map(async tweet => {
          let markdown
          try {
            markdown = await buildMarkdown(app, plugin, downloadManager, tweet, 'normal', null)
          } catch (error) {
            new Notice('There was a problem processing the downloaded tweet')
            console.error(error)
          }
          return markdown
        })
      )

      if(markdowns && markdowns.length > 0) {
        plugin.tweetMarkdown = markdowns.join('\n\n---\n\n')

        await downloadManager
          .finishDownloads()
          .catch(error => {
            new Notice('There was an error downloading the images.')
            console.error(error)
          })
          
        // clean up excessive newlines
        plugin.tweetMarkdown = plugin.tweetMarkdown.replace(/\n{2,}/g, '\n\n')
    
        // write the note to file
        if(file)
        {
          var t = await app.vault.read(file)
          app.vault.modify(file, [plugin.tweetMarkdown, t].join('\n\n---\n\n'))
          new Notice(`${fname} updated.`)
        }
        else
        {
          const newFile = await app.vault.create(`${fpath}/${fname}`, plugin.tweetMarkdown)
          new Notice(`${fname} created.`)
        }
      }
    })

    // clean up
    plugin.tweetMarkdown = ''
  }
  
  return {  
    pollRun,
  } as PollManager
}

export interface PollManager {
  pollRun: () => void
}
