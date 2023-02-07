interface StanzaConfig {
  Environment: string
  StanzaCustomerId: string
  Url: string
  RefreshSeconds?: number
  FeatureGroups: FeatureGroup[]
}

interface FeatureGroup {
  Name: string
  Features: string[]
}

export const configFromJSONString = (jsonString: string): StanzaConfig => {
  const config = JSON.parse(jsonString)

  const m: StanzaConfig = {
    Environment: config.Environment,
    StanzaCustomerId: config.StanzaCustomerId,
    Url: config.Url,
    FeatureGroups: config.FeatureGroups
  }
  return m
}

export type { StanzaConfig }
