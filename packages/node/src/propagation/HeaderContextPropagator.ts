import { type Context, type TextMapGetter, type TextMapPropagator, type TextMapSetter } from '@opentelemetry/api'
import { logger } from '../global/logger'

export class HeaderContextPropagator implements TextMapPropagator {
  constructor (private readonly headerName: string, private readonly contextKey: symbol) {}
  inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    const stanzaApiKey = context.getValue(this.contextKey)
    if (typeof (stanzaApiKey) === 'string' && stanzaApiKey !== '') {
      setter.set(carrier, this.headerName, stanzaApiKey)
    }
  }

  extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headerValue = getter.get(carrier, this.headerName)
    logger.info(`extracting ${this.headerName} %s`, headerValue)
    const apiKey = Array.isArray(headerValue) && headerValue.length > 0
      ? headerValue[0]
      : typeof (headerValue) === 'string' && headerValue !== ''
        ? headerValue
        : undefined

    return apiKey !== undefined ? context.setValue(this.contextKey, apiKey) : context
  }

  fields (): string[] {
    return [this.headerName]
  }
}
