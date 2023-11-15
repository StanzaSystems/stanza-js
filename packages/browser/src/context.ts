import { type FeatureState, groupBy, identity } from '@getstanza/core';
import { type StanzaFeature } from './feature';

export interface StanzaContext {
  readonly name: string;
  featuresNames: string[];
  features: Record<string, StanzaFeature>;
  ready: boolean;
}

export const createContext = (
  name: string,
  featureStates: FeatureState[],
  enablementNumber: number,
  ready = false
): StanzaContext => {
  const features = createFeaturesFromFeatureState(
    featureStates,
    enablementNumber
  ).reduce(groupBy('name', identity), {});

  return {
    name,
    featuresNames: Object.keys(features),
    features,
    ready,
  };
};

export function equals(context: StanzaContext, other: StanzaContext): boolean {
  if (context.name !== other.name) {
    return false;
  }

  // if the feature lengths are not the same obviously context not the same
  if (context.featuresNames.length !== other.featuresNames.length) {
    return false;
  }

  // for every feature, see if the other context has a feature with the exact same properties
  for (const f of Object.values(context.features)) {
    if (other.features[f.name] === undefined) {
      return false;
    }
  }
  return true;
}

export function createFeaturesFromFeatureState(
  featureResponse: FeatureState[],
  enablementNumber: number
): StanzaFeature[] {
  return featureResponse
    .map((featureState) =>
      createFeatureFromFeatureState(featureState, enablementNumber)
    )
    .filter((feature): feature is StanzaFeature => feature !== undefined);
}

export function createFeatureFromFeatureState(
  {
    enabledPercent,
    featureName,
    messageEnabled,
    messageDisabled,
    lastRefreshTime,
  }: FeatureState,
  enablementNumber: number
): StanzaFeature | undefined {
  if (enabledPercent >= 100) {
    return {
      name: featureName,
      disabled: false,
      message: messageEnabled,
      lastRefreshTime,
    };
  } else if (
    // if the enabled percent is less than this context's enablement number, this feature is enabled
    enabledPercent > enablementNumber
  ) {
    return {
      name: featureName,
      disabled: false,
      message: messageEnabled,
      lastRefreshTime,
    };
  } else {
    /// if not use values for a disabled feature
    return {
      name: featureName,
      disabled: true,
      message: messageDisabled,
      lastRefreshTime,
    };
  }
}
