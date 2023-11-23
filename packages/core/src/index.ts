import { getFeatureStates } from './getFeatureStates';
import { getFeatureStatesHot } from './getFeatureStatesHot';
import { getFeatureStatesStale } from './getFeatureStatesStale';
import * as globals from './globals';
import { init, initMobile } from './init';
export * from './eventEmitter';
export * from './withStanzaHeaders';
export * from './utils/isTruthy';

export type { FeatureState } from './models/featureState';
export type {
  LocalStateProvider,
  AsyncLocalStateProvider,
} from './models/localStateProvider';
export type { StanzaCoreConfig } from './models/stanzaCoreConfig';

export const utils = {
  globals,
};

export const Stanza = {
  init,
  initMobile,
  getFeatureStatesHot,
  getFeatureStatesStale,
  getFeatureStates,
  featureChanges: globals.featureChanges,
  enablementNumberChanges: globals.enablementNumberChanges,
};

export { identity } from './identity';
export { groupBy } from './groupBy';

export default Stanza;
