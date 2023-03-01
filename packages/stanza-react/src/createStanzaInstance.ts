import { StanzaBrowser } from 'stanza-browser'
import { type StanzaCoreConfig } from 'stanza-core'
import { type StanzaInstance } from './stanzaInstance'

export type StanzaConfig = StanzaCoreConfig

export const createStanzaInstance = (config: StanzaConfig): StanzaInstance => {
  StanzaBrowser.init(config)

  return {
    contextChanges: StanzaBrowser.contextChanges,
    featureChanges: StanzaBrowser.featureChanges
  }
}
