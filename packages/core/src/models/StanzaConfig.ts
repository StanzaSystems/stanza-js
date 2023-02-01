import { type Feature } from './Feature'

interface StanzaConfig {
  Environment: string
  StanzaCustomerId: string
  Url: string
  Tags?: string[]
  TestFeatures?: Feature[]
  TestGlobalMessage?: string
  LocalMode: boolean
}

export type { StanzaConfig }
