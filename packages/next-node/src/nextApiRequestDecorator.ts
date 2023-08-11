import { stanzaGuard, type StanzaGuardOptions } from '@getstanza/node'
import { type NextApiHandler } from 'next'
import { nextRequestErrorHandler } from './nextRequestErrorHandler'

export const nextApiRequestDecorator = (stanzaDecoratorOptions: StanzaGuardOptions) => {
  const aDecorator = stanzaGuard<Parameters<NextApiHandler>, ReturnType<NextApiHandler>>(stanzaDecoratorOptions)
  return (handler: NextApiHandler): NextApiHandler =>
    nextRequestErrorHandler(
      aDecorator.bind(handler)
    )
}
