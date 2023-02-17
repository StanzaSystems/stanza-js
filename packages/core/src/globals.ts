import { type LocalStateProvider } from './models/LocalStateProvider'
import { type StanzaConfig } from './models/StanzaConfig'

let stanzaConfig: StanzaConfig
let localStateProvider: LocalStateProvider
let enablementNumberGenerator: () => number

function init (config: StanzaConfig, provider: LocalStateProvider): void {
  if (stanzaConfig !== undefined || localStateProvider !== undefined) {
    throw new Error('Stanza is already initialized')
  }
  if (config.enablementNumberGenerator === undefined) {
    enablementNumberGenerator = getEnablementNumberSimple
  }
  stanzaConfig = config
  localStateProvider = provider
}

function getConfig (): StanzaConfig {
  if (stanzaConfig === undefined) {
    throw new Error('Stanza is not initialized')
  }
  return stanzaConfig
}

function getStateProvider (): LocalStateProvider {
  if (localStateProvider === undefined) {
    throw new Error('Stanza is not initialized')
  }
  return localStateProvider
}

function getEnablementNumber (): number {
  return enablementNumberGenerator()
}

function getEnablementNumberSimple (): number {
  return Math.floor(Math.random() * 99)
}

export default { init, getConfig, getStateProvider, getEnablementNumber }
