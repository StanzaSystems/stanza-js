interface StanzaConfig {
  Environment: string
  StanzaCustomerId: string
  Url: string
  RefreshSeconds?: number
  PageConfigs: PageConfig[]
}

interface PageConfig {
  Name: string
  Features: string[]
}

export const configFromJSONString = (jsonString: string): StanzaConfig => {
  const config = JSON.parse(jsonString)

  const m: StanzaConfig = {
    Environment: config.Environment,
    StanzaCustomerId: config.StanzaCustomerId,
    Url: config.Url,
    PageConfigs: config.PageConfigs
  }
  return m
}

export type { StanzaConfig }
