import { getGuardConfig } from '../../global/guardConfig'
import { getQuota } from '../../quota/getQuota'
import { StanzaGuardError } from '../stanzaGuardError'
import { type Tag } from '../model'

export interface QuotaCheckerOptions {
  guard: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

export const initQuotaChecker = (options: QuotaCheckerOptions) => {
  return { shouldCheckQuota, checkQuota }

  function shouldCheckQuota (): boolean {
    const guardConfig = getGuardConfig(options.guard)

    return guardConfig?.config?.checkQuota === true
  }

  async function checkQuota (): Promise<{ type: 'TOKEN_GRANTED', token: string } | null> {
    const token = await getQuota({
      ...options
    })
    if (token?.granted === false) {
      throw new StanzaGuardError('NoQuota', 'Guard can not be executed')
    }

    return token?.granted ? { type: 'TOKEN_GRANTED', token: token.token } : null
  }
}
