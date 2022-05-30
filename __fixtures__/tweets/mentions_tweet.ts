import {Tweet} from 'src/types/tweet'

export const MentionsTweet: Tweet = {
  data: {
    text: "I've just created a Node.js CLI tool to save tweets as Markdown, great for @NotionHQ, @RoamResearch, @obsdmd, and other Markdown based note-taking systems! https://t.co/9qzNhz5cmN",
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 0,
      quote_count: 0,
    },
    created_at: '2020-09-09T17:55:42.000Z',
    entities: {
      urls: [
        {
          start: 156,
          end: 179,
          url: 'https://t.co/9qzNhz5cmN',
          expanded_url: 'https://github.com/kbravh/tweet-to-markdown',
          display_url: 'github.com/kbravh/tweet-t…',
          images: [
            {
              url: 'https://pbs.twimg.com/news_img/1501819606129950722/opZrrpCT?format=jpg&name=orig',
              width: 1280,
              height: 640,
            },
            {
              url: 'https://pbs.twimg.com/news_img/1501819606129950722/opZrrpCT?format=jpg&name=150x150',
              width: 150,
              height: 150,
            },
          ],
          status: 200,
          title:
            'GitHub - kbravh/tweet-to-markdown: A command line tool to convert Tweets to Markdown.',
          description:
            'A command line tool to convert Tweets to Markdown. - GitHub - kbravh/tweet-to-markdown: A command line tool to convert Tweets to Markdown.',
          unwound_url: 'https://github.com/kbravh/tweet-to-markdown',
        },
      ],
      mentions: [
        {
          start: 75,
          end: 84,
          username: 'NotionHQ',
          id: '708915428454576128',
        },
        {
          start: 86,
          end: 99,
          username: 'RoamResearch',
          id: '1190410678273626113',
        },
        {
          start: 101,
          end: 108,
          username: 'obsdmd',
          id: '1239876481951596545',
        },
      ],
    },
    id: '1303753964291338240',
    author_id: '1143604512999034881',
    conversation_id: '1303753964291338240',
  },
  includes: {
    users: [
      {
        username: 'kbravh',
        name: 'Karey Higuera 🦈',
        id: '1143604512999034881',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1163169960505610240/R8BoDqiT_normal.jpg',
      },
    ],
  },
}
