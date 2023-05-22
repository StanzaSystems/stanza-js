import * as oTelApi from '@opentelemetry/api'
import { getAllStanzaBaggageEntries } from './getAllStanzaBaggageEntries'
import { type StanzaKey } from './model'

export const getAllActiveStanzaEntries = (): Array<{ key: StanzaKey, value: string }> => {
  const activeBaggage = oTelApi.propagation.getActiveBaggage()

  if (activeBaggage === undefined) {
    return []
  }

  return getAllStanzaBaggageEntries(activeBaggage).map(({ key, entry }) => ({ key, value: entry.value }))
}
