import { type Context, type TextMapGetter, type TextMapSetter } from '@opentelemetry/api'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import { addPriorityBoostToContextBaggage } from '../baggage/addPriorityBoostToContextBaggage'

export class StanzaPriorityBoostPropagator extends W3CBaggagePropagator {
  override inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    super.inject(addPriorityBoostToContextBaggage(context), carrier, setter)
  }

  override extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    return addPriorityBoostToContextBaggage(super.extract(context, carrier, getter))
  }
}
