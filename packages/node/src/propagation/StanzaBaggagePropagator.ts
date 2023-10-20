import {
  type Baggage,
  type Context,
  propagation,
  type TextMapGetter,
  type TextMapSetter
} from '@opentelemetry/api'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import { getStanzaBaggageEntry } from '../baggage/getStanzaBaggageEntry'
import { addPriorityBoostToContext, getPriorityBoostFromContext, deletePriorityBoostFromContext } from '../context/priorityBoost'
import { getStanzaBaggageKeys } from '../baggage/getStanzaBaggageKeys'

const getStanzaPriorityBoost = (baggage: Baggage) => {
  const baggageMaybePriorityBoost = parseInt(
    getStanzaBaggageEntry('stz-boost', baggage)?.value ?? ''
  )

  return !isNaN(baggageMaybePriorityBoost) ? baggageMaybePriorityBoost : 0
}

const stanzaBaggageKeys = getStanzaBaggageKeys('stz-boost')

export class StanzaBaggagePropagator extends W3CBaggagePropagator {
  override inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    const currentPriorityBoost = getPriorityBoostFromContext(context)
    const contextWithoutPriorityBoost = deletePriorityBoostFromContext(context)
    const baggage = propagation.getBaggage(contextWithoutPriorityBoost) ?? propagation.createBaggage()
    const baggageWithPriorityBoost = currentPriorityBoost !== 0
      ? stanzaBaggageKeys.reduce((resultBaggage, key) => {
        return resultBaggage.setEntry(key, { value: currentPriorityBoost.toFixed(0) })
      }, baggage)
      : baggage.removeEntries(...stanzaBaggageKeys)

    const contextWithBaggage = propagation.setBaggage(contextWithoutPriorityBoost, baggageWithPriorityBoost)

    super.inject(contextWithBaggage, carrier, setter)
  }

  override extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const contextWithBaggage = super.extract(context, carrier, getter)
    const baggage = propagation.getBaggage(contextWithBaggage) ?? propagation.createBaggage()
    const priorityBoost = getStanzaPriorityBoost(baggage)
    const contextWithPriorityBoost = addPriorityBoostToContext(priorityBoost)(contextWithBaggage)
    const newBaggage = baggage.removeEntries(...stanzaBaggageKeys)
    return propagation.setBaggage(contextWithPriorityBoost, newBaggage)
  }
}
