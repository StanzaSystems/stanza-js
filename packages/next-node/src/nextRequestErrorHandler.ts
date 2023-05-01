import { type NextApiHandler } from 'next'
import { StanzaDecoratorError } from '@getstanza/node'

export const nextRequestErrorHandler = (handler: NextApiHandler): NextApiHandler => {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (e) {
      if (e instanceof StanzaDecoratorError) {
        res.status(429).json({})
      } else {
        throw e
      }
    }
  }
}
