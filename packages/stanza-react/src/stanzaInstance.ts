import { type StanzaContext } from 'stanza-browser'
import { type FeatureState, type StanzaChangeEmitter } from 'stanza-core'

export interface StanzaInstance {
  contextChanges: StanzaChangeEmitter<StanzaContext>
  featureChanges: StanzaChangeEmitter<FeatureState>
}
