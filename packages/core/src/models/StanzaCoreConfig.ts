export interface StanzaCoreConfig {
  environment: string
  stanzaCustomerId: string
  url: string
  refreshSeconds?: number
  enablementNumberGenerator?: () => Promise<number>
  contextConfigs: ContextConfig[]
}

interface ContextConfig {
  name: string
  features: string[]
}
