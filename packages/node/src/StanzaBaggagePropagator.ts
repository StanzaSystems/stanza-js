import { type Context, propagation, type TextMapGetter, type TextMapSetter } from '@opentelemetry/api'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import { getAllStanzaBaggageEntries, getStanzaBaggageKeys } from './stanzaBaggageKey'

const enrichContextBaggage = (context: Context): Context => {
  const baggage = propagation.getBaggage(context)

  if (baggage === undefined) {
    return context
  }

  const stanzaEntries = getAllStanzaBaggageEntries(baggage)

  const newBaggage = stanzaEntries
    .map(({ key: stanzaKey, entry }) => getStanzaBaggageKeys(stanzaKey).map(key => ({ key, entry })))
    .flat()
    .reduce((currentBaggage, { key, entry }) => currentBaggage.setEntry(key, entry), baggage)

  return propagation.setBaggage(context, newBaggage)
}

export class StanzaBaggagePropagator extends W3CBaggagePropagator {
  override inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    super.inject(enrichContextBaggage(context), carrier, setter)
  }

  override extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    return enrichContextBaggage(super.extract(context, carrier, getter))
  }
}
