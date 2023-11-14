import { type Context } from '@opentelemetry/api'
import { stanzaTokenContextKey } from './stanzaTokenContextKey'

export const addStanzaTokenToContext =
  (token: string) =>
  (context: Context): Context =>
    context.setValue(stanzaTokenContextKey, token)
