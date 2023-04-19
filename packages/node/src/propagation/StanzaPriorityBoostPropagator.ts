import { type Baggage, type Context, propagation, type TextMapGetter, type TextMapSetter } from '@opentelemetry/api'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import { getStanzaBaggageEntry } from '../baggage/getStanzaBaggageEntry'
import { getStanzaBaggageKeys } from '../baggage/getStanzaBaggageKeys'
import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { stanzaPriorityBoostContextKey } from '../context/stanzaPriorityBoostContextKey'

const getStanzaPriorityBoost = (baggage: Baggage) => {
  const baggageMaybePriorityBoost = parseInt(getStanzaBaggageEntry('stz-boost', baggage)?.value ?? '')

  return !isNaN(baggageMaybePriorityBoost) ? baggageMaybePriorityBoost : 0
}

export const addPriorityBoostToContextBaggage = (context: Context): Context => {
  const baggage = propagation.getBaggage(context) ?? propagation.createBaggage()

  const contextWithTotalPriorityBoost = addPriorityBoostToContext(getStanzaPriorityBoost(baggage))(context)

  const totalPriorityBoost = contextWithTotalPriorityBoost.getValue(stanzaPriorityBoostContextKey)

  const boostStanzaBaggageKeys = getStanzaBaggageKeys('stz-boost')

  const newBaggage = typeof (totalPriorityBoost) !== 'number' || totalPriorityBoost === 0
    ? baggage.removeEntries(...boostStanzaBaggageKeys)
    : boostStanzaBaggageKeys
      .reduce((currentBaggage, key) => currentBaggage.setEntry(key, { value: totalPriorityBoost.toFixed(0) }), baggage)

  return propagation.setBaggage(context, newBaggage)
}

export class StanzaPriorityBoostPropagator extends W3CBaggagePropagator {
  override inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    super.inject(addPriorityBoostToContextBaggage(context), carrier, setter)
  }

  override extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    return addPriorityBoostToContextBaggage(super.extract(context, carrier, getter))
  }
}
