import {Notice, TFile} from 'obsidian'

export const createDownloadManager = (): DownloadManager => {
  let downloadList: Promise<TFile>[]
  let isAnnounced = false

  const addDownloads = (downloads: Promise<TFile>[]): void => {
    downloadList.push(...downloads)
    if (!isAnnounced) {
      isAnnounced = true
      new Notice('Downloading images...')
    }
  }
  const finishDownloads = (): Promise<TFile[]> => Promise.all(downloadList)

  return {
    addDownloads,
    finishDownloads,
  } as DownloadManager
}

export interface DownloadManager {
  addDownloads: (downloads: Promise<TFile>[]) => void
  finishDownloads: () => Promise<TFile[]>
}
