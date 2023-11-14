import * as oTelApi from '@opentelemetry/api'
import { getStanzaBaggageEntry } from './getStanzaBaggageEntry'
import { type StanzaKey } from './model'

export const getActiveStanzaEntry = (key: StanzaKey): string | undefined => {
  const activeBaggage = oTelApi.propagation.getActiveBaggage()

  if (activeBaggage === undefined) {
    return undefined
  }

  return getStanzaBaggageEntry(key, activeBaggage)?.value
}
