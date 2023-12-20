import {
  type DefaultContextAttributes,
  eventDataToDefaultContextAttributes,
} from './defaultContextAttributes';
import {
  type GuardAttributes,
  eventDataToGuardAttributes,
} from './guardAttributes';
import {
  eventDataToFeatureAttributes,
  type FeatureAttributes,
} from './featureAttributes';
import {
  type GuardData,
  type DefaultContextData,
  type FeatureData,
} from '../../../index';

export type RequestAttributes = DefaultContextAttributes &
  GuardAttributes &
  FeatureAttributes;

export const eventDataToRequestAttributes = (
  data: DefaultContextData & GuardData & FeatureData
): RequestAttributes => ({
  ...eventDataToDefaultContextAttributes(data),
  ...eventDataToGuardAttributes(data),
  ...eventDataToFeatureAttributes(data),
});
