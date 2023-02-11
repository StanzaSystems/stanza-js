interface StanzaConfig {
  environment: string
  stanzaCustomerId: string
  url: string
  refreshSeconds?: number
  contextConfigs: ContextConfig[]
}

interface ContextConfig {
  name: string
  features: string[]
}

export const configFromJSONString = (jsonString: string): StanzaConfig => {
  const config = JSON.parse(jsonString)

  const m: StanzaConfig = {
    environment: config.environment,
    stanzaCustomerId: config.stanzaCustomerId,
    url: config.url,
    contextConfigs: config.contextConfigs
  }
  return m
}

export type { StanzaConfig }
