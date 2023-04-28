import * as oTelApi from '@opentelemetry/api'

const STANZA_DECORATOR_CONTEXT_KEY_SYMBOL = Symbol.for('StanzaDecoratorContextKey')

interface StanzaDecoratorContextKeyGlobal {
  [STANZA_DECORATOR_CONTEXT_KEY_SYMBOL]: symbol | undefined
}

const stanzaDecoratorContextKeyGlobal = global as unknown as StanzaDecoratorContextKeyGlobal

export const stanzaDecoratorContextKey = stanzaDecoratorContextKeyGlobal[STANZA_DECORATOR_CONTEXT_KEY_SYMBOL] = stanzaDecoratorContextKeyGlobal[STANZA_DECORATOR_CONTEXT_KEY_SYMBOL] ?? oTelApi.createContextKey(
  'Stanza Decorator Key')
