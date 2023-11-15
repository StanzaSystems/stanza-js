import { type FeatureState } from './featureState';

export function featureStatesEqual(o: FeatureState, f: FeatureState): boolean {
  return (
    o.featureName === f.featureName &&
    o.enabledPercent === f.enabledPercent &&
    o.messageEnabled === f.messageEnabled &&
    o.messageDisabled === f.messageDisabled
  );
}
