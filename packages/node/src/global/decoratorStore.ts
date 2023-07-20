const STANZA_DECORATOR_STORE_SYMBOL = Symbol.for('[Stanza SDK Internal] Decorator store')

interface Decorator {
  initialized: boolean
}

interface StanzaDecoratorStoreGlobal {
  [STANZA_DECORATOR_STORE_SYMBOL]: Map<string, Decorator> | undefined
}
const stanzaDecoratorStoreGlobal = globalThis as unknown as StanzaDecoratorStoreGlobal

export const decoratorStore: Map<string, Decorator> = stanzaDecoratorStoreGlobal[STANZA_DECORATOR_STORE_SYMBOL] = stanzaDecoratorStoreGlobal[STANZA_DECORATOR_STORE_SYMBOL] ?? new Map()
