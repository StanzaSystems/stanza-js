import { hubService } from '../global/hubService'
import { type StanzaToken } from '../hub/model'
import { withTimeout } from '../utils/withTimeout'
import { tokenStore } from '../global/tokenStore'

const CHECK_QUOTA_TIMEOUT = 1000

interface GetQuotaOptions {
  decorator: string
  isStrictSynchronousQuota: boolean
  feature?: string
  priorityBoost?: number
}
export const getQuota = async (options: GetQuotaOptions): Promise<StanzaToken | null> => {
  // TODO
  // if (decoratorConfigFromContext.isStrict()) {
  //   // call hub
  // } else {
  //   // call store
  // }
  try {
    return await withTimeout(
      CHECK_QUOTA_TIMEOUT,
      'Check quota timed out',
      options.isStrictSynchronousQuota
        ? hubService.getToken(options)
        : tokenStore.getToken(options)
    )
  } catch (e) {
    console.warn('Failed to fetch the token:', e instanceof Error ? e.message : e)
  }

  return null
}
