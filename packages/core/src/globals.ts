import { StanzaChangeTarget } from './eventEmitter'
import { type LocalStateProvider } from './models/localStateProvider'
import { type StanzaCoreConfig } from './models/StanzaCoreConfig'

interface StanzaInternalConfig {
  environment: string
  stanzaCustomerId: string
  url: string
  refreshSeconds?: number
  enablementNumberGenerator?: () => number
  contextConfigs: Record<string, { features: string[] }>
}

let stanzaConfig: StanzaInternalConfig
let localStateProvider: LocalStateProvider
let enablementNumberGenerator: () => number

export const changes = new StanzaChangeTarget()

export function init (config: StanzaCoreConfig, provider: LocalStateProvider): void {
  if (stanzaConfig !== undefined || localStateProvider !== undefined) {
    throw new Error('Stanza is already initialized')
  }
  if (config.enablementNumberGenerator === undefined) {
    enablementNumberGenerator = getEnablementNumberSimple
  }
  stanzaConfig = {
    ...config,
    contextConfigs: config.contextConfigs.reduce<StanzaInternalConfig['contextConfigs']>((res, config) => {
      return {
        ...res,
        [config.name]: {
          features: config.features
        }
      }
    }, {})
  }
  localStateProvider = provider
}

export function getConfig (): StanzaInternalConfig {
  if (stanzaConfig === undefined) {
    throw new Error('Stanza is not initialized')
  }
  return stanzaConfig
}

export function getStateProvider (): LocalStateProvider {
  if (localStateProvider === undefined) {
    throw new Error('Stanza is not initialized')
  }
  return localStateProvider
}

export function getEnablementNumber (): number {
  return enablementNumberGenerator()
}

function getEnablementNumberSimple (): number {
  return Math.floor(Math.random() * 99)
}
