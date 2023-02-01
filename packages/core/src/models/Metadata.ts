export interface Metadata {
  Environment: string
  StanzaCustomerId: string
  Url: string
  LocalMode: boolean
  Tags: Map<string, string>
}

export const metadataFromJSONString = (jsonString: string): Metadata => {
  const metadata = JSON.parse(jsonString)

  const m: Metadata = {
    Environment: metadata.Environment,
    StanzaCustomerId: metadata.StanzaCustomerId,
    Url: metadata.Url,
    LocalMode: metadata.LocalMode,
    Tags: new Map<string, string>(Object.entries(metadata.tags ?? {}))
  }
  return m
}
