import * as oTelApi from '@opentelemetry/api'

const STANZA_TRACE_META_CONTEXT_KEY_SYMBOL = Symbol.for(
  'StanzaTraceMetaContextKey'
)

interface StanzaTraceMetaContextKeyGlobal {
  [STANZA_TRACE_META_CONTEXT_KEY_SYMBOL]: symbol | undefined
}
const stanzaTraceMetaContextKeyGlobal =
  global as unknown as StanzaTraceMetaContextKeyGlobal

export const stanzaTraceMetaContextKey = (stanzaTraceMetaContextKeyGlobal[
  STANZA_TRACE_META_CONTEXT_KEY_SYMBOL
] =
  stanzaTraceMetaContextKeyGlobal[STANZA_TRACE_META_CONTEXT_KEY_SYMBOL] ??
  oTelApi.createContextKey('Stanza Trace Meta'))
