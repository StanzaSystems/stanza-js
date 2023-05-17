import { type Attributes } from '@opentelemetry/api'

export interface FeatureAttributes extends Attributes {
  feature: string
}

export const eventDataToFeatureAttributes = (data: any): FeatureAttributes => ({
  feature: data.featureName
})
