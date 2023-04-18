import { type Context, type TextMapGetter, type TextMapPropagator, type TextMapSetter } from '@opentelemetry/api'
import { stanzaApiKeyContextKey } from '../context/stanzaApiKeyContextKey'

const headerApiKey = 'x-stanza-key'

export class StanzaApiKeyPropagator implements TextMapPropagator {
  inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    const stanzaApiKey = context.getValue(stanzaApiKeyContextKey)
    if (typeof (stanzaApiKey) === 'string' && stanzaApiKey !== '') {
      setter.set(carrier, headerApiKey, stanzaApiKey)
    }
  }

  extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headerValue = getter.get(carrier, headerApiKey)
    const apiKey = Array.isArray(headerValue) && headerValue.length > 0
      ? headerValue[0]
      : typeof (headerValue) === 'string' && headerValue !== ''
        ? headerValue
        : undefined

    return apiKey !== undefined ? context.setValue(stanzaApiKeyContextKey, headerValue) : context
  }

  fields (): string[] {
    return [headerApiKey]
  }
}
