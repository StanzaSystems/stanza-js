import { type Context, propagation } from '@opentelemetry/api'
import { getStanzaBaggageKeys } from '../getStanzaBaggageKeys'

const stanzaBaggageKeys = getStanzaBaggageKeys('stz-boost')

export const setPriorityBoostInContextBaggage =
  (priorityBoost: number) =>
  (context: Context): Context => {
    const baggage =
      propagation.getBaggage(context) ?? propagation.createBaggage()
    const baggageWithPriorityBoost =
      priorityBoost !== 0
        ? stanzaBaggageKeys.reduce((resultBaggage, key) => {
            return resultBaggage.setEntry(key, {
              value: priorityBoost.toFixed(0)
            })
          }, baggage)
        : baggage.removeEntries(...stanzaBaggageKeys)

    return propagation.setBaggage(context, baggageWithPriorityBoost)
  }
