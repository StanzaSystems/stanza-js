import { type Baggage, type BaggageEntry } from '@opentelemetry/api'

const STANZA_KEYS = ['stz-feat', 'stz-boost'] as const
const STANZA_JAEGER_KEYS = STANZA_KEYS.map(key => `uberctx-${key}` as const)
const STANZA_DATADOG_KEYS = STANZA_KEYS.map(key => `ot-baggage-${key}` as const)
type StanzaKey = typeof STANZA_KEYS[number]
type StanzaJaegerKey = typeof STANZA_JAEGER_KEYS[number]
type StanzaDatadogKey = typeof STANZA_DATADOG_KEYS[number]

export const getStanzaBaggageKeys = (key: StanzaKey) => {
  const jaggerKey: StanzaJaegerKey = `uberctx-${key}`
  const datadogKey: StanzaDatadogKey = `ot-baggage-${key}`

  return [key, jaggerKey, datadogKey]
}

const isTruthy = <T>(v: T): v is NonNullable<T> => Boolean(v)
export const getStanzaBaggageKey = (key: StanzaKey, baggage: Baggage): BaggageEntry | undefined => {
  return getStanzaBaggageKeys(key)
    .map(key => baggage.getEntry(key)).filter(isTruthy)[0]
}

export const getAllStanzaBaggageEntries = (baggage: Baggage) => {
  return STANZA_KEYS
    .map(key => ({ key, entry: getStanzaBaggageKey(key, baggage) }))
    .filter((v): v is { key: StanzaKey, entry: BaggageEntry } => isTruthy(v.entry))
}
