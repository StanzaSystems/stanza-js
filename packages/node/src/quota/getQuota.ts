import { hubService } from '../global/hubService'
import { type StanzaToken } from '../hub/model'
import { withTimeout } from '../utils/withTimeout'

const CHECK_QUOTA_TIMEOUT = 1000

interface GetQuotaOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}
export const getQuota = async (options: GetQuotaOptions): Promise<StanzaToken | null> => {
  try {
    return await withTimeout(
      CHECK_QUOTA_TIMEOUT,
      'Check quota timed out',
      hubService.getToken(options)
    )
  } catch (e) {
    console.warn('Failed to fetch the token:', e instanceof Error ? e.message : e)
  }

  return null

  // return hubService.getToken(options)
}
