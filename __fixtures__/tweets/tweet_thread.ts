import {Tweet} from 'src/types/tweet'

export const TweetThread: Tweet[] = [
  {
    data: {
      author_id: '221658618',
      conversation_id: '1277645969975377923',
      entities: {
        annotations: [
          {
            start: 150,
            end: 154,
            probability: 0.5227,
            type: 'Product',
            normalized_text: 'Apple',
          },
        ],
        urls: [
          {
            start: 172,
            end: 195,
            url: 'https://t.co/YjOLsIGVRD',
            expanded_url:
              'https://twitter.com/geoffreylitt/status/1277645969975377923/photo/1',
            display_url: 'pic.twitter.com/YjOLsIGVRD',
            media_key: '3_1277628647332089863',
          },
          {
            start: 172,
            end: 195,
            url: 'https://t.co/YjOLsIGVRD',
            expanded_url:
              'https://twitter.com/geoffreylitt/status/1277645969975377923/photo/1',
            display_url: 'pic.twitter.com/YjOLsIGVRD',
            media_key: '3_1277628708845768704',
          },
        ],
      },
      public_metrics: {
        retweet_count: 13,
        reply_count: 5,
        like_count: 119,
        quote_count: 1,
      },
      id: '1277645969975377923',
      text: 'A theory about why tools like Airtable and Notion are so compelling: they provide a much-needed synthesis between the design philosophies of UNIX and Apple.\n\nShort thread: https://t.co/YjOLsIGVRD',
      attachments: {
        media_keys: ['3_1277628647332089863', '3_1277628708845768704'],
      },
      created_at: '2020-06-29T16:51:51.000Z',
    },
    includes: {
      media: [
        {
          media_key: '3_1277628647332089863',
          type: 'photo',
          url: 'https://pbs.twimg.com/media/EbsMfE8XkAc9TiK.png',
        },
        {
          media_key: '3_1277628708845768704',
          type: 'photo',
          url: 'https://pbs.twimg.com/media/EbsMiqGX0AAwi9R.jpg',
        },
      ],
      users: [
        {
          name: 'Geoffrey Litt',
          profile_image_url:
            'https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg',
          id: '221658618',
          username: 'geoffreylitt',
        },
      ],
    },
  },
  {
    data: {
      public_metrics: {
        retweet_count: 2,
        reply_count: 1,
        like_count: 29,
        quote_count: 0,
      },
      text: 'UNIX is still the best working example of "tools not apps": small sharp tools that the user can flexibly compose to meet their needs.\n\nOnce you\'ve written a few bash pipelines, it\'s hard to be satisfied with disconnected, siloed "apps"',
      conversation_id: '1277645969975377923',
      created_at: '2020-06-29T16:51:51.000Z',
      entities: {
        annotations: [
          {
            start: 0,
            end: 3,
            probability: 0.4213,
            type: 'Product',
            normalized_text: 'UNIX',
          },
        ],
      },
      id: '1277645971401433090',
      author_id: '221658618',
      referenced_tweets: [
        {
          type: 'replied_to',
          id: '1277645969975377923',
        },
      ],
    },
    includes: {
      users: [
        {
          id: '221658618',
          profile_image_url:
            'https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg',
          name: 'Geoffrey Litt',
          username: 'geoffreylitt',
        },
      ],
    },
  },
  {
    data: {
      attachments: {
        media_keys: ['3_1277630070321025025'],
      },
      id: '1277645972529647616',
      text: 'The problem is, while the roots are solid, the terminal as UI is extremely hostile to users, esp beginners. No discoverability, cryptic flags, lots of cruft and chaos.\n\nhttps://t.co/JOVVRw3iWU https://t.co/TjOL7PXU2y',
      conversation_id: '1277645969975377923',
      referenced_tweets: [
        {
          type: 'quoted',
          id: '1187357294415302657',
        },
        {
          type: 'replied_to',
          id: '1277645971401433090',
        },
      ],
      entities: {
        urls: [
          {
            start: 169,
            end: 192,
            url: 'https://t.co/JOVVRw3iWU',
            expanded_url:
              'https://twitter.com/geoffreylitt/status/1187357294415302657',
            display_url: 'twitter.com/geoffreylitt/s…',
          },
          {
            start: 193,
            end: 216,
            url: 'https://t.co/TjOL7PXU2y',
            expanded_url:
              'https://twitter.com/geoffreylitt/status/1277645972529647616/photo/1',
            display_url: 'pic.twitter.com/TjOL7PXU2y',
            media_key: '3_1277630070321025025',
          },
        ],
      },
      created_at: '2020-06-29T16:51:52.000Z',
      author_id: '221658618',
      public_metrics: {
        retweet_count: 0,
        reply_count: 1,
        like_count: 19,
        quote_count: 0,
      },
    },
    includes: {
      media: [
        {
          media_key: '3_1277630070321025025',
          type: 'photo',
          url: 'https://pbs.twimg.com/media/EbsNx5_XkAEncJW.png',
        },
      ],
      users: [
        {
          username: 'geoffreylitt',
          id: '221658618',
          profile_image_url:
            'https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_normal.jpg',
          name: 'Geoffrey Litt',
        },
      ],
    },
  },
]
