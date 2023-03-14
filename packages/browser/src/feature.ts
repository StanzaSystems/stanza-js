export interface StanzaFeature {
  name: string
  code: ActionCode
  message?: string | undefined
  lastRefreshTime: number
}

export enum ActionCode {
  ENABLED = 0,
  DISABLED_VISIBLE = 1,
  DISABLED_REMOVE = 2
}
