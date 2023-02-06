interface StanzaConfig {
  Environment: string
  StanzaCustomerId: string
  Url: string
  RefreshSeconds?: number
  PageFeatures: Map<string, string[]>
}

export const configFromJSONString = (jsonString: string): StanzaConfig => {
  const config = JSON.parse(jsonString)

  const m: StanzaConfig = {
    Environment: config.Environment,
    StanzaCustomerId: config.StanzaCustomerId,
    Url: config.Url,
    PageFeatures: new Map<string, string[]>(Object.entries(config.PageFeatures ?? {}))
  }
  return m
}

export type { StanzaConfig }
