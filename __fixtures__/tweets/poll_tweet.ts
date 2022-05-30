import {Tweet} from 'src/types/tweet'

export const PollTweet: Tweet = {
  data: {
    conversation_id: '1029121914260860929',
    id: '1029121914260860929',
    created_at: '2018-08-13T21:45:59.000Z',
    text: 'Which is Better?',
    attachments: {
      poll_ids: ['1029121913858269191'],
    },
    public_metrics: {
      retweet_count: 7,
      reply_count: 11,
      like_count: 47,
      quote_count: 2,
    },
    author_id: '4071934995',
  },
  includes: {
    polls: [
      {
        id: '1029121913858269191',
        options: [
          {
            position: 1,
            label: 'Spring',
            votes: 1373,
          },
          {
            position: 2,
            label: 'Fall',
            votes: 3054,
          },
        ],
      },
    ],
    users: [
      {
        id: '4071934995',
        name: 'polls',
        username: 'polls',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/660160253913382913/qgvYqknJ_normal.jpg',
      },
    ],
  },
}
