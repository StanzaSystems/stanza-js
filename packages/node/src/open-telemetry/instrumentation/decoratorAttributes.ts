import { type Attributes } from '@opentelemetry/api'
import { type DecoratorData, type OptionalDecoratorData } from '../../global/eventBus'

export interface DecoratorAttributes extends Attributes {
  decorator: string
}
export const eventDataToDecoratorAttributes = (data: DecoratorData): DecoratorAttributes => ({
  decorator: data.decoratorName
})
export const eventDataToOptionalDecoratorAttributes = (data: OptionalDecoratorData): Partial<DecoratorAttributes> => ({
  decorator: data.decoratorName
})
