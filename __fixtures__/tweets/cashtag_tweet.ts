import {Tweet} from 'src/types/tweet'

export const cashtagTweet: Tweet = {
  data: {
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 1,
      quote_count: 0,
    },
    created_at: '2020-09-02T16:15:47.000Z',
    id: '1301192107143561219',
    entities: {
      urls: [
        {
          start: 102,
          end: 125,
          url: 'https://t.co/qnyDphmJm2',
          expanded_url:
            'https://twitter.com/BTheriot2014/status/1301180406226513921',
          display_url: 'twitter.com/BTheriot2014/s…',
        },
      ],
      hashtags: [
        {
          start: 22,
          end: 31,
          tag: 'cashtags',
        },
        {
          start: 88,
          end: 95,
          tag: 'coffee',
        },
      ],
      cashtags: [
        {
          start: 52,
          end: 57,
          tag: 'SBUX',
        },
      ],
    },
    conversation_id: '1301192107143561219',
    text: 'Today I learned about #cashtags  - and found out my $SBUX is in current tweet!  Must be #coffee time! https://t.co/qnyDphmJm2',
    referenced_tweets: [
      {
        type: 'quoted',
        id: '1301180406226513921',
      },
    ],
    author_id: '1058876047465209856',
  },
  includes: {
    users: [
      {
        id: '1058876047465209856',
        username: 'Ceascape_ca',
        name: 'ceascape.business.solutions',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1058877044015038464/u68hN9LW_normal.jpg',
      },
    ],
  },
}
