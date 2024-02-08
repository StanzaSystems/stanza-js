import { type FeatureState } from './featureState';

type LocalStateChangeListener = (event: {
  oldValue: FeatureState | undefined;
  newValue: FeatureState;
}) => void;

export interface LocalStateProvider {
  init: (config: unknown) => Promise<void>;
  setFeatureState: (context: FeatureState) => Promise<void>;
  getFeatureState: (name: string) => Promise<FeatureState | undefined>;
  getAllFeatureStates: () => Promise<FeatureState[]>;
  addChangeListener: (callback: LocalStateChangeListener) => () => void;
  removeChangeListener: (callback: LocalStateChangeListener) => void;
}
