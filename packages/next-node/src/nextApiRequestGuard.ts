import { stanzaGuard, type StanzaGuardOptions } from '@getstanza/node'
import { type NextApiHandler } from 'next'
import { nextRequestErrorHandler } from './nextRequestErrorHandler'

export const nextApiRequestGuard = (stanzaGuardOptions: StanzaGuardOptions) => {
  const aGuard = stanzaGuard<
    Parameters<NextApiHandler>,
    ReturnType<NextApiHandler>
  >(stanzaGuardOptions)
  return (handler: NextApiHandler): NextApiHandler =>
    nextRequestErrorHandler(aGuard.bind(handler))
}
