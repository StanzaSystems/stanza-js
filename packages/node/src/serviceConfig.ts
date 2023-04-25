import { type ServiceConfig } from './hub/model'

const STANZA_SERVICE_CONFIG_SYMBOL = Symbol.for('Service Config')
const STANZA_SERVICE_CONFIG_LISTENERS_SYMBOL = Symbol.for('Service Config Listeners')

type ServiceConfigListener = (config: ServiceConfig) => void

interface StanzaServiceConfigGlobal {
  [STANZA_SERVICE_CONFIG_SYMBOL]: ServiceConfig | undefined
  [STANZA_SERVICE_CONFIG_LISTENERS_SYMBOL]: ServiceConfigListener[] | undefined
}
const stanzaServiceConfigGlobal = globalThis as unknown as StanzaServiceConfigGlobal

let serviceConfig = stanzaServiceConfigGlobal[STANZA_SERVICE_CONFIG_SYMBOL]
const serviceConfigListeners = stanzaServiceConfigGlobal[STANZA_SERVICE_CONFIG_LISTENERS_SYMBOL] = stanzaServiceConfigGlobal[STANZA_SERVICE_CONFIG_LISTENERS_SYMBOL] ?? []

export const getServiceConfig = () => serviceConfig

export const updateServiceConfig = (newConfig: ServiceConfig) => {
  serviceConfig = stanzaServiceConfigGlobal[STANZA_SERVICE_CONFIG_SYMBOL] = newConfig

  serviceConfigListeners.forEach(listener => {
    listener(newConfig)
  })
}

export const addServiceConfigListener = (listener: ServiceConfigListener) => {
  serviceConfigListeners.push(listener)

  return () => {
    const listenerIndex = serviceConfigListeners.indexOf(listener)
    if (listenerIndex < 0) {
      return
    }
    serviceConfigListeners.splice(listenerIndex, 1)
  }
}
