import { StanzaChangeTarget } from './eventEmitter'
import { groupBy } from './index'
import { type FeatureState } from './models/featureState'
import { type LocalStateProvider } from './models/localStateProvider'
import { type StanzaCoreConfig } from './models/stanzaCoreConfig'

interface StanzaInternalConfig {
  environment: string
  stanzaCustomerId: string
  url: string
  refreshSeconds?: number
  enablementNumberGenerator?: () => Promise<number>
  contextConfigs: Record<string, { features: string[] }>
}

let stanzaConfig: StanzaInternalConfig
let localStateProvider: LocalStateProvider
let enablementNumberGenerator: () => Promise<number>
let enablementNumber = 100

export const featureChanges = new StanzaChangeTarget<FeatureState>()
export const enablementNumberChanges = new StanzaChangeTarget<number>()

export function init (config: StanzaCoreConfig, provider: LocalStateProvider): void {
  if (stanzaConfig !== undefined || localStateProvider !== undefined) {
    throw new Error('Stanza is already initialized')
  }
  enablementNumberGenerator = config.enablementNumberGenerator ?? getEnablementNumberSimple
  stanzaConfig = {
    ...config,
    contextConfigs: config.contextConfigs
      .reduce(groupBy('name', ({ features }) => ({ features })), {})
  }
  localStateProvider = provider

  void getEnablementNumber()
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

export async function getEnablementNumber (): Promise<number> {
  return enablementNumberGenerator().then(nr => {
    enablementNumber = nr
    enablementNumberChanges.dispatchChange(nr)
    return nr
  })
}

export function getEnablementNumberStale (): number {
  return enablementNumber
}

async function getEnablementNumberSimple (): Promise<number> {
  return Promise.resolve(Math.floor(Math.random() * 99))
}
