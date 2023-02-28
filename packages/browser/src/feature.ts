export interface Feature {
  name: string
  code: ActionCode
  message?: string | undefined
  lastRefreshTime: number
}

export enum ActionCode {
  MESSAGE_AND_SEND = 0,
  MESSAGE_NO_SEND = 1,
  REMOVE = 2
}

export function validateFeature (f: Feature): void {
  if (f.code !== undefined && !(f.code in ActionCode)) {
    throw new Error(`Error: unknown enabled action for feature ${f.name}`)
  }
  if (f.code !== undefined && !(f.code in ActionCode)) {
    throw new Error(`Error: unknown disabled action for feature ${f.name}`)
  }
}
