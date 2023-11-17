import { getFeatureStates } from './getFeatureStates';
import { getFeatureStatesHot } from './getFeatureStatesHot';
import { getFeatureStatesStale } from './getFeatureStatesStale';
import * as globals from './globals';
import { init, initState } from './init';
export * from './eventEmitter';
export * from './withStanzaHeaders';

export type { FeatureState } from './models/featureState';
export type { LocalStateProvider } from './models/localStateProvider';
export type { StanzaCoreConfig } from './models/stanzaCoreConfig';

export const utils = {
  globals,
};

export const Stanza = {
  init,
  initState,
  getFeatureStatesHot,
  getFeatureStatesStale,
  getFeatureStates,
  featureChanges: globals.featureChanges,
  enablementNumberChanges: globals.enablementNumberChanges,
};

export { identity } from './identity';
export { groupBy } from './groupBy';

export default Stanza;
