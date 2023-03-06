import { StanzaBrowser } from '@getstanza/browser'
import { type StanzaCoreConfig } from '@getstanza/core'
import { type StanzaInstance } from './stanzaInstance'

export type StanzaConfig = StanzaCoreConfig

export const createStanzaInstance = (config: StanzaConfig): StanzaInstance => {
  StanzaBrowser.init(config)

  return {
    contextChanges: StanzaBrowser.contextChanges,
    featureChanges: StanzaBrowser.featureChanges
  }
}
