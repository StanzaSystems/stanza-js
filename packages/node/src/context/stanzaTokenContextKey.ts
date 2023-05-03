import * as oTelApi from '@opentelemetry/api'

const STANZA_TOKEN_CONTEXT_KEY_SYMBOL = Symbol.for('StanzaTokenContextKey')

interface StanzaTokenContextKeyGlobal { [STANZA_TOKEN_CONTEXT_KEY_SYMBOL]: symbol | undefined }
const stanzaTokenContextKeyGlobal = global as unknown as StanzaTokenContextKeyGlobal

export const stanzaTokenContextKey = stanzaTokenContextKeyGlobal[STANZA_TOKEN_CONTEXT_KEY_SYMBOL] = stanzaTokenContextKeyGlobal[STANZA_TOKEN_CONTEXT_KEY_SYMBOL] ?? oTelApi.createContextKey('Stanza Token')
