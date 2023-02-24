import { type FeatureState } from 'stanza-core'

export function featureStatesEqual (o: FeatureState, f: FeatureState): boolean {
  return o.featureName === f.featureName &&
    o.enabledPercent === f.enabledPercent &&
    o.messageEnabled === f.messageEnabled &&
    o.actionCodeEnabled === f.actionCodeEnabled &&
    o.messageDisabled === f.messageDisabled &&
    o.actionCodeDisabled === f.actionCodeDisabled
}
