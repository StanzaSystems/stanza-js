import * as oTelApi from '@opentelemetry/api'

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace global {
  let stanzaApiKeyContextKey: symbol | undefined
}

export const stanzaApiKeyContextKey = global.stanzaApiKeyContextKey = global.stanzaApiKeyContextKey ?? oTelApi.createContextKey(
  'Stanza API Key')
