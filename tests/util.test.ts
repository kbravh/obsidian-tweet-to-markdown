import {assert, describe, it} from 'vitest'
import {getTweetID} from 'src/util'

describe.concurrent('Tweet ID', async () => {
  it('Extracts tweet Id from regular URL', async () => {
    assert.equal(
      getTweetID('https://twitter.com/whataweekhuh/status/1511656964538916868'),
      '1511656964538916868'
    )
  })
  it('Extracts tweet Id from regular URL with query params', async () => {
    assert.equal(
      getTweetID(
        'https://twitter.com/whataweekhuh/status/1511656964538916868?s=20&t=tbYKVygf0nKOlvn4CpyKYw'
      ),
      '1511656964538916868'
    )
  })
  it('Errors on invalid URL', async () => {
    assert.throws(() => getTweetID("I'm not a URL"))
  })
})
