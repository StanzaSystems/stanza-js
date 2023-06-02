export interface Tag {
  key: string
  value: string
}

export interface StanzaDecoratorOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}
