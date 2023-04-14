import { type Context, type TextMapGetter, type TextMapSetter } from '@opentelemetry/api'
import { W3CBaggagePropagator } from '@opentelemetry/core'
import { enrichContextWithStanzaBaggage } from '../baggage/enrichContextWithStanzaBaggage'

export class StanzaBaggagePropagator extends W3CBaggagePropagator {
  override inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    super.inject(enrichContextWithStanzaBaggage(context), carrier, setter)
  }

  override extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    return enrichContextWithStanzaBaggage(super.extract(context, carrier, getter))
  }
}
