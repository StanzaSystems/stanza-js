import { type Context } from '@opentelemetry/api'
import { stanzaApiKeyContextKey } from './stanzaApiKeyContextKey'

export const addStanzaApiKeyToContext = (token: string) => (context: Context): Context => context.setValue(stanzaApiKeyContextKey, token)
