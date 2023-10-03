import { StanzaBrowser } from '@getstanza/browser'
import { type StanzaCoreConfig } from '@getstanza/core'

export type StanzaConfig = StanzaCoreConfig

export const initStanza = (config: StanzaConfig): void => {
  StanzaBrowser.init(config)
}
