import { stanzaDecorator, type StanzaDecoratorOptions } from '@getstanza/node'
import { type NextApiHandler } from 'next'
import { nextRequestErrorHandler } from './nextRequestErrorHandler'

export const nextApiRequestDecorator = (stanzaDecoratorOptions: StanzaDecoratorOptions) => {
  const aDecorator = stanzaDecorator<Parameters<NextApiHandler>, ReturnType<NextApiHandler>>(stanzaDecoratorOptions)
  return (handler: NextApiHandler): NextApiHandler =>
    nextRequestErrorHandler(
      aDecorator.bind(handler)
    )
}
