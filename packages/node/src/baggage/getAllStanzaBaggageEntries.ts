import { type Baggage, type BaggageEntry } from '@opentelemetry/api'
import { isTruthy } from '../utils/isTruthy'
import { getStanzaBaggageEntry } from './getStanzaBaggageEntry'
import { STANZA_KEYS, type StanzaKey } from './model'

export const getAllStanzaBaggageEntries = (baggage: Baggage) => {
  return STANZA_KEYS
    .map(key => ({ key, entry: getStanzaBaggageEntry(key, baggage) }))
    .filter((v): v is { key: StanzaKey, entry: BaggageEntry } => isTruthy(v.entry))
}
