import { getGuardConfig } from '../../global/guardConfig'
import { getQuota } from '../../quota/getQuota'
import { type Tag } from '../model'
import { getActiveStanzaEntry } from '../../baggage/getActiveStanzaEntry'
import { getPriorityBoostFromContext } from '../../context/priorityBoost'
import { context } from '@opentelemetry/api'
import { type ReasonData } from '../../global/eventBus'
import { type CheckerResponse } from './types'

export interface QuotaCheckerOptions {
  guard: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

type CheckQuotaResponse = CheckerResponse<'QUOTA', { token: string }, { message: string }> & {
  reason: Pick<ReasonData, 'quotaReason'>
}

export const initQuotaChecker = (options: QuotaCheckerOptions) => {
  return { shouldCheckQuota, checkQuota }

  function shouldCheckQuota (): boolean {
    const guardConfig = getGuardConfig(options.guard)

    return guardConfig?.config?.checkQuota === true
  }

  async function checkQuota (): Promise<CheckQuotaResponse> {
    const priorityBoost = getPriorityBoostFromContext(context.active())
    const token = await getQuota({
      ...options,
      feature: getActiveStanzaEntry('stz-feat') ?? options.feature,
      priorityBoost: priorityBoost !== 0 ? priorityBoost : undefined
    })
    if (token?.granted === false) {
      return {
        type: 'QUOTA',
        status: 'failure',
        reason: { quotaReason: 'QUOTA_BLOCKED' },
        message: 'Guard can not be executed'
      }
    }

    return token?.granted
      ? {
          type: 'QUOTA',
          status: 'success',
          token: token.token,
          reason: { quotaReason: 'QUOTA_GRANTED' }
        }
      : {
          type: 'QUOTA',
          status: 'failOpen',
          reason: {
            quotaReason: 'QUOTA_ERROR'
          }
        }
  }
}
