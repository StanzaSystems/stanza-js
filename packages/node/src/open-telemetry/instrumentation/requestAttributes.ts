import { type DefaultContextAttributes, eventDataToDefaultContextAttributes } from './defaultContextAttributes'
import { type DecoratorAttributes, eventDataToDecoratorAttributes } from './decoratorAttributes'
import { eventDataToFeatureAttributes, type FeatureAttributes } from './featureAttributes'

export type RequestAttributes = DefaultContextAttributes & DecoratorAttributes & FeatureAttributes

export const eventDataToRequestAttributes = (data: any): RequestAttributes => ({
  ...eventDataToDefaultContextAttributes(data),
  ...eventDataToDecoratorAttributes(data),
  ...eventDataToFeatureAttributes(data)
})
