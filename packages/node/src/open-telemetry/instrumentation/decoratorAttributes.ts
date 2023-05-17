import { type Attributes } from '@opentelemetry/api'

export interface DecoratorAttributes extends Attributes {
  decorator: string
}
export const eventDataToDecoratorAttributes = (data: any): DecoratorAttributes => ({
  decorator: data.decoratorName
})
