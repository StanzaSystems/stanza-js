import { type Context, type TextMapGetter, type TextMapPropagator, type TextMapSetter } from '@opentelemetry/api'
import { stanzaHeadersToSpanContextKey } from '../context/stanzaHeadersToSpanContextKey'
import { applyTo, flatten, map, pipe, uniq } from 'ramda'

export class RequestHeadersToSpanPropagatorConfigured implements TextMapPropagator {
  constructor (private readonly traceConfigs: Array<{
    requestHeaderName: string[]
    responseHeaderName: string[]
    spanSelectors: Array<{
      otelAttribute: string
      value: string
    }>
  }>) {}

  inject (context: Context, carrier: any, setter: TextMapSetter): void {}

  extract (context: Context, carrier: any, getter: TextMapGetter): Context {
    const entries = this.fields().map(field => ({
      key: field,
      value: getter.get(carrier, field)
    })).filter(({ value }) => value !== undefined)

    return context.setValue(stanzaHeadersToSpanContextKey, entries)
  }

  fields (): string[] {
    return applyTo(this.traceConfigs)(
      pipe(
        map(({ requestHeaderName, responseHeaderName }) => [requestHeaderName, responseHeaderName]),
        flatten,
        uniq
      ))
  }
}
