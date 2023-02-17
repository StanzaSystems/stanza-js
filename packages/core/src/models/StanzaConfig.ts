interface StanzaConfig {
  environment: string
  stanzaCustomerId: string
  url: string
  refreshSeconds?: number
  enablementNumberGenerator?: () => number
  contextConfigs: ContextConfig[]
}

interface ContextConfig {
  name: string
  features: string[]
}

export type { StanzaConfig }
