import { type Attributes } from '@opentelemetry/api'
import { type DecoratorData } from '../../global/eventBus'

export interface DecoratorAttributes extends Attributes {
  decorator: string
}
export const eventDataToDecoratorAttributes = (data: DecoratorData): DecoratorAttributes => ({
  decorator: data.decoratorName
})
