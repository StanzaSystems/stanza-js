import { type Attributes } from '@opentelemetry/api';
import { type FeatureData } from '@getstanza/sdk-base';

export interface FeatureAttributes extends Attributes {
  feature: string;
}

export const eventDataToFeatureAttributes = (
  data: FeatureData
): FeatureAttributes => ({
  feature: data.featureName,
});
