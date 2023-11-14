import { type GuardConfig } from '../hub/model'

const STANZA_GUARD_CONFIG_SYMBOL = Symbol.for(
  '[Stanza SDK Internal] Guard Config'
)
const STANZA_GUARD_CONFIG_LISTENERS_SYMBOL = Symbol.for(
  '[Stanza SDK Internal] Guard Config Listeners'
)

export type GuardConfigListener = (config: GuardConfig) => void

interface StanzaGuardConfigGlobal {
  [STANZA_GUARD_CONFIG_SYMBOL]: Record<string, GuardConfig> | undefined
  [STANZA_GUARD_CONFIG_LISTENERS_SYMBOL]:
    | Record<string, GuardConfigListener[]>
    | undefined
}
const stanzaGuardConfigGlobal = globalThis as unknown as StanzaGuardConfigGlobal

const guardConfig = (stanzaGuardConfigGlobal[STANZA_GUARD_CONFIG_SYMBOL] =
  stanzaGuardConfigGlobal[STANZA_GUARD_CONFIG_SYMBOL] ?? {})
const guardConfigListeners = (stanzaGuardConfigGlobal[
  STANZA_GUARD_CONFIG_LISTENERS_SYMBOL
] = stanzaGuardConfigGlobal[STANZA_GUARD_CONFIG_LISTENERS_SYMBOL] ?? {})

export const getGuardConfig = (name: string): GuardConfig | undefined =>
  guardConfig[name]

export const updateGuardConfig = (name: string, newConfig: GuardConfig) => {
  guardConfig[name] = newConfig

  guardConfigListeners[name]?.forEach((listener) => {
    listener(newConfig)
  })
}

export const addGuardConfigListener = (
  guardName: string,
  listener: GuardConfigListener
) => {
  guardConfigListeners[guardName] = guardConfigListeners[guardName] ?? []
  guardConfigListeners[guardName].push(listener)

  return () => {
    const listenerIndex = guardConfigListeners[guardName].indexOf(listener)
    if (listenerIndex < 0) {
      return
    }
    guardConfigListeners[guardName].splice(listenerIndex, 1)
  }
}
