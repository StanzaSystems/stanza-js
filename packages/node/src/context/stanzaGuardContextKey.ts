import * as oTelApi from '@opentelemetry/api'

const STANZA_GUARD_CONTEXT_KEY_SYMBOL = Symbol.for('StanzaGuardContextKey')

interface StanzaGuardContextKeyGlobal {
  [STANZA_GUARD_CONTEXT_KEY_SYMBOL]: symbol | undefined
}

const stanzaGuardContextKeyGlobal = global as unknown as StanzaGuardContextKeyGlobal

export const stanzaGuardContextKey = stanzaGuardContextKeyGlobal[STANZA_GUARD_CONTEXT_KEY_SYMBOL] = stanzaGuardContextKeyGlobal[STANZA_GUARD_CONTEXT_KEY_SYMBOL] ?? oTelApi.createContextKey(
  'Stanza Guard Key')
