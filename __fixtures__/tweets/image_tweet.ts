import {Tweet} from 'src/types/tweet'

export const ImageTweet: Tweet = {
  data: {
    created_at: '2020-08-10T15:30:23.000Z',
    conversation_id: '1292845757297557505',
    id: '1292845757297557505',
    attachments: {
      media_keys: ['3_1292845624120025090', '3_1292845644567269376'],
    },
    entities: {
      annotations: [
        {
          start: 104,
          end: 115,
          probability: 0.9801,
          type: 'Person',
          normalized_text: 'Mary Douglas',
        },
      ],
      urls: [
        {
          start: 260,
          end: 283,
          url: 'https://t.co/O2P7WRO1XL',
          expanded_url: 'http://maggieappleton.com/dirt',
          display_url: 'maggieappleton.com/dirt',
        },
        {
          start: 284,
          end: 307,
          url: 'https://t.co/PSk7lHiv7z',
          expanded_url:
            'https://twitter.com/Mappletons/status/1292845757297557505/photo/1',
          display_url: 'pic.twitter.com/PSk7lHiv7z',
          media_key: '3_1292845624120025090',
        },
        {
          start: 284,
          end: 307,
          url: 'https://t.co/PSk7lHiv7z',
          expanded_url:
            'https://twitter.com/Mappletons/status/1292845757297557505/photo/1',
          display_url: 'pic.twitter.com/PSk7lHiv7z',
          media_key: '3_1292845644567269376',
        },
      ],
    },
    author_id: '1343443016',
    text: '"Dirt is matter out of place" - the loveliest definition of dirt you could hope for from anthropologist Mary Douglas in her classic 1966 book Purity and Danger\n\nHair on my head? Clean. Hair on the table? Dirty!\n\nIllustrating &amp; expanding on her main ideas: https://t.co/O2P7WRO1XL https://t.co/PSk7lHiv7z',
    public_metrics: {
      retweet_count: 29,
      reply_count: 11,
      like_count: 191,
      quote_count: 2,
    },
  },
  includes: {
    media: [
      {
        media_key: '3_1292845624120025090',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/EfEcPs8XoAIXwvH.jpg',
      },
      {
        media_key: '3_1292845644567269376',
        type: 'photo',
        url: 'https://pbs.twimg.com/media/EfEcQ5HX0AA2EvY.jpg',
      },
    ],
    users: [
      {
        username: 'Mappletons',
        id: '1343443016',
        name: 'Maggie Appleton 🧭',
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1079304561892966406/1AHsGSnz_normal.jpg',
      },
    ],
  },
}
