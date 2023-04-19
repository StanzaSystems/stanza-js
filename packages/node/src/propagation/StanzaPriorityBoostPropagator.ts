import { type Context, propagation, type TextMapGetter, type TextMapSetter } from '@opentelemetry/api'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import { getStanzaBaggageEntry } from '../baggage/getStanzaBaggageEntry'
import { getStanzaBaggageKeys } from '../baggage/getStanzaBaggageKeys'
import { stanzaPriorityBoostContextKey } from '../context/stanzaPriorityBoostContextKey'

export const addPriorityBoostToContextBaggage = (context: Context): Context => {
  const contextPriorityBoost = context.getValue(stanzaPriorityBoostContextKey)

  if (typeof (contextPriorityBoost) !== 'number') {
    return context
  }

  const baggage = propagation.getBaggage(context) ?? propagation.createBaggage()

  const baggageMaybePriorityBoost = parseInt(getStanzaBaggageEntry('stz-boost', baggage)?.value ?? '')

  const baggagePriorityBoost = !isNaN(baggageMaybePriorityBoost) ? baggageMaybePriorityBoost : 0

  const boostStanzaBaggageKeys = getStanzaBaggageKeys('stz-boost')

  const totalPriorityBoost = baggagePriorityBoost + contextPriorityBoost

  const newBaggage = totalPriorityBoost !== 0
    ? boostStanzaBaggageKeys
      .reduce((currentBaggage, key) => currentBaggage.setEntry(key, { value: totalPriorityBoost.toFixed(0) }), baggage)
    : baggage.removeEntries(...boostStanzaBaggageKeys)

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
