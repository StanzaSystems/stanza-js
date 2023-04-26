import { type DecoratorConfig } from '../hub/model'

const STANZA_DECORATOR_CONFIG_SYMBOL = Symbol.for('Decorator Config')
const STANZA_DECORATOR_CONFIG_LISTENERS_SYMBOL = Symbol.for('Decorator Config Listeners')

export type DecoratorConfigListener = (config: DecoratorConfig) => void

interface StanzaDecoratorConfigGlobal {
  [STANZA_DECORATOR_CONFIG_SYMBOL]: Record<string, DecoratorConfig> | undefined
  [STANZA_DECORATOR_CONFIG_LISTENERS_SYMBOL]: Record<string, DecoratorConfigListener[]> | undefined
}
const stanzaDecoratorConfigGlobal = globalThis as unknown as StanzaDecoratorConfigGlobal

const decoratorConfig = stanzaDecoratorConfigGlobal[STANZA_DECORATOR_CONFIG_SYMBOL] = stanzaDecoratorConfigGlobal[STANZA_DECORATOR_CONFIG_SYMBOL] ?? {}
const decoratorConfigListeners = stanzaDecoratorConfigGlobal[STANZA_DECORATOR_CONFIG_LISTENERS_SYMBOL] = stanzaDecoratorConfigGlobal[STANZA_DECORATOR_CONFIG_LISTENERS_SYMBOL] ?? {}

export const getDecoratorConfig = (name: string): DecoratorConfig | undefined => decoratorConfig[name]

export const updateDecoratorConfig = (name: string, newConfig: DecoratorConfig) => {
  decoratorConfig[name] = newConfig

  decoratorConfigListeners[name]?.forEach(listener => {
    listener(newConfig)
  })
}

export const addDecoratorConfigListener = (decoratorName: string, listener: DecoratorConfigListener) => {
  decoratorConfigListeners[decoratorName] = decoratorConfigListeners[decoratorName] ?? []
  decoratorConfigListeners[decoratorName].push(listener)

  return () => {
    const listenerIndex = decoratorConfigListeners[decoratorName].indexOf(listener)
    if (listenerIndex < 0) {
      return
    }
    decoratorConfigListeners[decoratorName].splice(listenerIndex, 1)
  }
}
