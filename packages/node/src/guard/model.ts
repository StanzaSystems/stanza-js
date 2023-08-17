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
