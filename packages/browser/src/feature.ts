export interface StanzaFeature {
  name: string
  code: ActionCode
  message?: string | undefined
  lastRefreshTime: number
}

export enum ActionCode {
  ENABLED = -1,
  MESSAGE_AND_SEND = 0,
  MESSAGE_NO_SEND = 1,
  REMOVE = 2
}
