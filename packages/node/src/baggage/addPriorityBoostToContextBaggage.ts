import { type Baggage, type Context, propagation } from '@opentelemetry/api'
import {
  addPriorityBoostToContext,
  getPriorityBoostFromContext
} from '../context/priorityBoost'
import { getStanzaBaggageEntry } from './getStanzaBaggageEntry'
import { getStanzaBaggageKeys } from './getStanzaBaggageKeys'

const getStanzaPriorityBoost = (baggage: Baggage) => {
  const baggageMaybePriorityBoost = parseInt(getStanzaBaggageEntry('stz-boost', baggage)?.value ?? '')

  return !isNaN(baggageMaybePriorityBoost) ? baggageMaybePriorityBoost : 0
}

export const addPriorityBoostToContextBaggage = (context: Context): Context => {
  const baggage = propagation.getBaggage(context) ?? propagation.createBaggage()

  const contextWithTotalPriorityBoost = addPriorityBoostToContext(getStanzaPriorityBoost(baggage))(context)

  const totalPriorityBoost = getPriorityBoostFromContext(contextWithTotalPriorityBoost)

  const boostStanzaBaggageKeys = getStanzaBaggageKeys('stz-boost')

  const newBaggage = totalPriorityBoost === 0
    ? baggage.removeEntries(...boostStanzaBaggageKeys)
    : boostStanzaBaggageKeys
      .reduce((currentBaggage, key) => currentBaggage.setEntry(key, { value: totalPriorityBoost.toFixed(0) }), baggage)

  return propagation.setBaggage(context, newBaggage)
}
