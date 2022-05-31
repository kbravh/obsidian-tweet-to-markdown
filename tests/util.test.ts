import {createFilename, getTweetID, sanitizeFilename} from '../src/util'
import {ImageTweet} from '../__fixtures__/tweets'

jest.mock('obsidian', () => {
  // eslint-disable-next-line node/no-unpublished-import
  const moment = require('moment')
  return {
    __esModule: true,
    moment,
  }
})

describe('Tweet ID', () => {
  it('Extracts tweet Id from regular URL', async () => {
    expect(
      getTweetID('https://twitter.com/whataweekhuh/status/1511656964538916868')
    ).toBe('1511656964538916868')
  })
  it('Extracts tweet Id from URL with query params', async () => {
    expect(
      getTweetID(
        'https://twitter.com/whataweekhuh/status/1511656964538916868?s=20&t=tbYKVygf0nKOlvn4CpyKYw'
      )
    ).toBe('1511656964538916868')
  })
  it('Errors on invalid URL', async () => {
    expect(() => getTweetID('not-a-url')).toThrowError()
  })
})

describe('Sanitize filename', () => {
  it('Allows for nested directories', () => {
    expect(sanitizeFilename('assets/tweets', 'encode', 'directory')).toBe(
      'assets/tweets'
    )
  })
  it('Removes slashes from filenames', () => {
    expect(sanitizeFilename('file/name.md', 'encode')).toBe('filename.md')
  })
})

describe('Create filename', () => {
  it('Defaults to "handle - id" if no pattern provided', () => {
    expect(createFilename(ImageTweet)).toBe(
      'Mappletons - 1292845757297557505.md'
    )
  })
  it('Sanitizes unsafe filename characters', () => {
    expect(createFilename(ImageTweet, '?<>hello:*|"')).toBe('hello.md')
  })
  it('Replaces handle, id, and name', () => {
    expect(createFilename(ImageTweet, '[[handle]] - [[id]] - [[name]]')).toBe(
      'Mappletons - 1292845757297557505 - Maggie Appleton 🧭.md'
    )
  })
  it('Does not double extension if .md is present', () => {
    expect(
      createFilename(ImageTweet, '[[handle]] - [[id]] - [[name]].md')
    ).toBe('Mappletons - 1292845757297557505 - Maggie Appleton 🧭.md')
  })
  it('Replaces text and truncates', () => {
    expect(createFilename(ImageTweet, '[[text]]')).toBe(
      'Dirt is matter out of place - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and DangerHair on my head Clean. Hair on the table Dirty!Illustrating &amp; expanding on her main ideas h.md'
    )
  })
  it('Replaces date with format from arguments', () => {
    expect(
      createFilename(ImageTweet, '[[handle]] - [[date]]', {
        locale: 'en',
        format: 'YYYY-MM-DD',
      })
    ).toBe('Mappletons - 2020-08-10.md')
  })
  it('Replaces date with format from arguments with different locale', () => {
    expect(
      createFilename(ImageTweet, '[[handle]] - [[date]]', {
        locale: 'es',
        format: 'LL',
      })
    ).toBe('Mappletons - 10 de agosto de 2020.md')
  })
  it('Replaces date with inline format', () => {
    expect(
      createFilename(ImageTweet, '[[handle]] - [[date:LL]]', {
        locale: 'en',
        format: 'YYYY-DD-MM',
      })
    ).toBe('Mappletons - August 10, 2020.md')
  })
  it('Replaces date with inline format with different locale', () => {
    expect(
      createFilename(ImageTweet, '[[handle]] - [[date:LL:es]]', {
        locale: 'en',
        format: 'YYYY-DD-MM',
      })
    ).toBe('Mappletons - 10 de agosto de 2020.md')
  })
  it('Replaces date with inline locale and default format', () => {
    expect(
      createFilename(ImageTweet, '[[handle]] - [[date::es]]', {
        locale: 'en',
        format: 'LL',
      })
    ).toBe('Mappletons - 10 de agosto de 2020.md')
  })
  it('Partial date does not trigger date logic', () => {
    expect(createFilename(ImageTweet, '[[date - [[handle]]')).toBe(
      '[[date - Mappletons.md'
    )
  })
})
