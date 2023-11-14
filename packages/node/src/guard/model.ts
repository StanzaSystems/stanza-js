export interface Tag {
  key: string
  value: string
}

export interface StanzaGuardOptions {
  guard: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

export interface StanzaGuardHealthOptions {
  guard: string
  feature: string
  environment: string
  priorityBoost?: number
  tags?: Tag[]
}

export enum Health {
  Unspecified = 'Unspecified',
  Ok = 'Ok',
  Overloaded = 'Overloaded',
  Down = 'Down'
}
