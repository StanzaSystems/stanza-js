import { type LocalStateProvider } from './models/LocalStateProvider'
import { type StanzaConfig } from './models/StanzaConfig'

let stanzaConfig: StanzaConfig
let localStateProvider: LocalStateProvider

function init (config: StanzaConfig, provider: LocalStateProvider): void {
  if (stanzaConfig !== undefined || localStateProvider !== undefined) {
    throw new Error('Stanza is already initialized')
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

export default { init, getConfig, getStateProvider }
