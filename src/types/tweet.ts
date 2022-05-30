export interface Annotation {
  start: number
  end: number
  probability: number
  type: 'Person' | 'Place' | 'Product' | 'Organization' | 'Other'
  normalized_text: string
}

export interface Attachment {
  poll_ids?: string[]
  media_keys?: string[]
}

export interface Data {
  id: string
  text: string
  created_at: string
  author_id: string
  public_metrics: Metrics
  entities?: Entities
  conversation_id?: string
  attachments?: Attachment
  referenced_tweets?: ReferencedTweet[]
}

export interface Entities {
  urls?: TweetURL[]
  mentions?: Mention[]
  annotations?: Annotation[]
  hashtags?: Tag[]
  cashtags?: Tag[]
}

export interface Error {
  detail: string
}

export interface Includes {
  polls?: Poll[]
  users: User[]
  media?: Media[]
}

export interface Media {
  media_key: string
  type: 'photo' | 'gif' | 'video'
  url?: string
  alt_text?: string
}

export interface Mention {
  start: number
  end: number
  username: string
  id?: string
}

export interface Metrics {
  retweet_count: number
  reply_count: number
  like_count: number
  quote_count: number
}

export interface OpenGraphImage {
  url: string
  width: number
  height: number
}

export interface Poll {
  id: string
  options: PollOption[]
}

export interface PollOption {
  position: number
  label: string
  votes: number
}

export interface ReferencedTweet {
  type: 'quoted' | 'replied_to'
  id: string
}

export interface Tag {
  start: number
  end: number
  tag: string
}

export interface Tweet {
  includes: Includes
  data: Data
  errors?: Error[]
  // other error fields
  reason?: string
  status?: number
}

export interface TweetURL {
  start: number
  end: number
  url: string
  expanded_url: string
  display_url: string
  media_key?: string
  images?: OpenGraphImage[]
  status?: number
  title?: string
  description?: string
  unwound_url?: string
}

export interface User {
  name: string
  id: string
  username: string
  profile_image_url: string
}
