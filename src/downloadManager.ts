import { Notice } from "obsidian";

export const createDownloadManager = () => {
  let downloadList: any[] = []
  let isAnnounced = false;

  const addDownloads = (downloads: Promise<any>[]): void => {
    downloadList.push(downloads)
    if (!isAnnounced){
      isAnnounced = true;
      new Notice('Downloading images...')
    }
  }
  const finishDownloads = () => Promise.all(downloadList)

  return {
    addDownloads,
    finishDownloads
  } as DownloadManager
}

export interface DownloadManager {
  addDownloads: (downloads: Promise<any>[]) => void;
  finishDownloads: () => Promise<any[]>;
}
