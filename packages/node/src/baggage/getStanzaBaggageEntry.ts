import { type Baggage, type BaggageEntry } from '@opentelemetry/api'
import { isTruthy } from '../utils/isTruthy'
import { getStanzaBaggageKeys } from './getStanzaBaggageKeys'
import { type StanzaKey } from './model'

export const getStanzaBaggageEntry = (key: StanzaKey, baggage: Baggage): BaggageEntry | undefined => {
  return getStanzaBaggageKeys(key)
    .map(key => baggage.getEntry(key)).filter(isTruthy)[0]
}
