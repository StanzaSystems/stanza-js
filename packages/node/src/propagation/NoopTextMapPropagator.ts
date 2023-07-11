import { type Context, type TextMapGetter, type TextMapPropagator, type TextMapSetter } from '@opentelemetry/api'

export class NoopTextMapPropagator implements TextMapPropagator {
  inject (context: Context, carrier: any, setter: TextMapSetter<any>): void {}

  extract (context: Context, carrier: any, getter: TextMapGetter<any>): Context {
    return context
  }

  fields (): string[] {
    return []
  }
}
