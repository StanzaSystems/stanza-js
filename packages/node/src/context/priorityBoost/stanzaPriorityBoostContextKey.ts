import * as oTelApi from '@opentelemetry/api'

const STANZA_PRIORITY_BOOST_CONTEXT_KEY_SYMBOL = Symbol.for(
  'Stanza Priority Boost Context Key'
)

interface StanzaPriorityBoostContextKeyGlobal {
  [STANZA_PRIORITY_BOOST_CONTEXT_KEY_SYMBOL]: symbol | undefined
}
const stanzaPriorityBoostContextKeyGlobal =
  global as unknown as StanzaPriorityBoostContextKeyGlobal

export const stanzaPriorityBoostContextKey =
  (stanzaPriorityBoostContextKeyGlobal[
    STANZA_PRIORITY_BOOST_CONTEXT_KEY_SYMBOL
  ] =
    stanzaPriorityBoostContextKeyGlobal[
      STANZA_PRIORITY_BOOST_CONTEXT_KEY_SYMBOL
    ] ?? oTelApi.createContextKey('Stanza Priority Boost'))
