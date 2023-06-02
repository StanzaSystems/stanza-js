import { getDecoratorConfig } from '../../global/decoratorConfig'
import { getQuota } from '../../quota/getQuota'
import { StanzaDecoratorError } from '../stanzaDecoratorError'
import { type Tag } from '../model'

export interface QuotaCheckerOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

export const initQuotaChecker = (options: QuotaCheckerOptions) => {
  return { shouldCheckQuota, checkQuota }

  function shouldCheckQuota (): boolean {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }

  async function checkQuota (): Promise<{ type: 'TOKEN_GRANTED', token: string } | null> {
    const token = await getQuota({
      ...options
    })
    if (token?.granted === false) {
      throw new StanzaDecoratorError('NoQuota', 'Decorator can not be executed')
    }

    return token?.granted ? { type: 'TOKEN_GRANTED', token: token.token } : null
  }
}
