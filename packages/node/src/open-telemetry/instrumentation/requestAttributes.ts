import { type DefaultContextAttributes, eventDataToDefaultContextAttributes } from './defaultContextAttributes'
import { type DecoratorAttributes, eventDataToDecoratorAttributes } from './decoratorAttributes'
import { eventDataToFeatureAttributes, type FeatureAttributes } from './featureAttributes'
import { type DecoratorData, type DefaultContextData, type FeatureData } from '../../global/eventBus'

export type RequestAttributes = DefaultContextAttributes & DecoratorAttributes & FeatureAttributes

export const eventDataToRequestAttributes = (data: DefaultContextData & DecoratorData & FeatureData): RequestAttributes => ({
  ...eventDataToDefaultContextAttributes(data),
  ...eventDataToDecoratorAttributes(data),
  ...eventDataToFeatureAttributes(data)
})
