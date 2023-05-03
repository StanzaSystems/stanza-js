import { type Context, type TextMapGetter, type TextMapPropagator, type TextMapSetter } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'

const headerStanzaToken = 'x-stanza-token'

export class StanzaTokenPropagator implements TextMapPropagator {
  inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    const stanzaToken = context.getValue(stanzaTokenContextKey)
    if (typeof (stanzaToken) === 'string' && stanzaToken !== '') {
      setter.set(carrier, headerStanzaToken, stanzaToken)
    }
  }

  extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headerValue = getter.get(carrier, headerStanzaToken)
    const token = Array.isArray(headerValue) && headerValue.length > 0
      ? headerValue[0]
      : typeof (headerValue) === 'string' && headerValue !== ''
        ? headerValue
        : undefined

    return token !== undefined ? context.setValue(stanzaTokenContextKey, token) : context
  }

  fields (): string[] {
    return [headerStanzaToken]
  }
}
