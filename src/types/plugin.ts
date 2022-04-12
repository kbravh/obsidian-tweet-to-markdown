export enum TweetCompleteActions {
  newTab = 'newTab',
  activeWindow = 'activeWindow',
  never = 'never',
}

export type TweetCompleteAction = keyof typeof TweetCompleteActions
