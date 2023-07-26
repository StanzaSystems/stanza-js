import { type StanzaToken } from '../hub/model'
import { withTimeout } from '../utils/withTimeout'
import { tokenStore } from '../global/tokenStore'
import { hubService } from '../global/hubService'
import { getDecoratorConfig } from '../global/decoratorConfig'
import { logger } from '../global/logger'
import { type Tag } from '../decorator/model'
import { STANZA_REQUEST_TIMEOUT } from '../global/requestTimeout'
import { STANZA_SKIP_TOKEN_CACHE } from '../global/skipTokenCache'

interface GetQuotaOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

export const getQuota = async (options: GetQuotaOptions): Promise<StanzaToken | null> => {
  try {
    return await withTimeout(
      STANZA_REQUEST_TIMEOUT,
      'Check quota timed out',
      getQuotaInternal(options)
    )
  } catch (e) {
    logger.warn('Failed to fetch the token: %o', e instanceof Error ? e.message : e)
  }

  return null
}

const getQuotaInternal = async (options: GetQuotaOptions): Promise<StanzaToken | null> => {
  const incomingQuotaTags = options.tags ?? []
  const decoratorConfig = getDecoratorConfig(options.decorator)
  const validDecoratorQuotaTags = decoratorConfig?.config.quotaTags ?? []
  const validQuotaTags = incomingQuotaTags.filter(incomingTag => validDecoratorQuotaTags.includes(incomingTag.key))
  const invalidQuotaTags = incomingQuotaTags.filter(incomingTag => !validDecoratorQuotaTags.includes(incomingTag.key))

  if (invalidQuotaTags.length > 0) {
    logger.info('Unused tags in decorator \'%s\'. Tags: %o', options.decorator, invalidQuotaTags.map(t => t.key))
  }

  if (validQuotaTags.length > 0) {
    return hubService.getToken({
      ...options,
      tags: validQuotaTags
    })
  }
  const tokenInfo = STANZA_SKIP_TOKEN_CACHE
    ? await hubService.getToken(options)
    : await tokenStore.getToken(options)
  if (tokenInfo?.granted === true) {
    tokenStore.markTokenAsConsumed(tokenInfo.token)
  }
  return tokenInfo
}
