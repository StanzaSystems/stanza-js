import { type StanzaToken } from '../hub/model'
import { withTimeout } from '../utils/withTimeout'
import { tokenStore } from '../global/tokenStore'
import { hubService } from '../global/hubService'
import { getDecoratorConfig } from '../global/decoratorConfig'
import { logger } from '../global/logger'

const CHECK_QUOTA_TIMEOUT = 1000

interface GetQuotaOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
  tags?: string[]
}

export const getQuota = async (options: GetQuotaOptions): Promise<StanzaToken | null> => {
  try {
    return await withTimeout(
      CHECK_QUOTA_TIMEOUT,
      'Check quota timed out',
      getQuotaInternal(options)
    )
  } catch (e) {
    logger.warn('Failed to fetch the token:', e instanceof Error ? e.message : e)
  }

  return null
}

const getQuotaInternal = async (options: GetQuotaOptions): Promise<StanzaToken | null> => {
  const incomingQuotaTags = options.tags ?? []
  const decoratorConfig = getDecoratorConfig(options.decorator)
  const validDecoratorQuotaTags = decoratorConfig?.config.quotaTags ?? []
  const validQuotaTags = incomingQuotaTags.filter(incomingTag => validDecoratorQuotaTags.includes(incomingTag))

  if (validQuotaTags.length > 0) {
    return hubService.getToken({
      ...options,
      tags: validQuotaTags
    })
  }
  const tokenInfo = await tokenStore.getToken(options)
  if (tokenInfo?.granted === true) {
    tokenStore.markTokenAsConsumed(tokenInfo.token)
  }
  return tokenInfo
}
