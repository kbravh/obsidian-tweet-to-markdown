import {createFilename, getTweetID, sanitizeFilename} from '../src/util'
import {ImageTweet} from '../__fixtures__/tweets'

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
    expect(createFilename(ImageTweet)).toBe('')
  })
  it('Sanitizes unsafe filename characters', () => {})
  it('Replaces handle, id, and name', () => {})
  it('Replaces text and truncates', () => {})
  it('Replaces date with format from settings', () => {})
  it('Replaces date with inline format', () => {})
})
