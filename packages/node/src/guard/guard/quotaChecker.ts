import { getGuardConfig } from '../../global/guardConfig';
import { getQuota } from '../../quota/getQuota';
import { type Tag } from '../model';
import { getActiveStanzaEntry } from '../../baggage/getActiveStanzaEntry';
import { getPriorityBoostFromContext } from '../../context/priorityBoost';
import { context } from '@opentelemetry/api';
import { type QuotaReason, type ReasonData } from '../../global/eventBus';
import { type CheckerResponse } from './types';
import { TimeoutError } from '../../utils/withTimeout';

export interface QuotaCheckerOptions {
  guard: string;
  feature?: string;
  priorityBoost?: number;
  tags?: Tag[];
}

type CheckQuotaResponse = CheckerResponse<
  'QUOTA',
  { token: string },
  { message: string }
> & {
  reason: Pick<ReasonData, 'quotaReason'>;
};

export const initQuotaChecker = (options: QuotaCheckerOptions) => {
  return { shouldCheckQuota, checkQuota };

  function shouldCheckQuota(): boolean {
    const guardConfig = getGuardConfig(options.guard);

    return guardConfig?.config?.checkQuota === true;
  }

  async function checkQuota(): Promise<CheckQuotaResponse> {
    try {
      const priorityBoost = getPriorityBoostFromContext(context.active());
      const token = await getQuota({
        ...options,
        feature: getActiveStanzaEntry('stz-feat') ?? options.feature,
        priorityBoost: priorityBoost !== 0 ? priorityBoost : undefined,
      });

      if (token === null) {
        return quotaFailOpen('QUOTA_ERROR');
      }

      return token.granted
        ? quotaSuccess('QUOTA_GRANTED', token.token)
        : quotaFailure('QUOTA_BLOCKED', 'Guard can not be executed');
    } catch (e) {
      if (e instanceof TimeoutError) {
        return quotaFailOpen('QUOTA_TIMEOUT');
      }
      throw e;
    }
  }
};

function quotaFailure(
  quotaReason: QuotaReason,
  message: string,
): CheckQuotaResponse {
  return {
    type: 'QUOTA',
    status: 'failure',
    reason: {
      quotaReason,
    },
    message,
  };
}

function quotaSuccess(
  quotaReason: QuotaReason,
  token: string,
): CheckQuotaResponse {
  return {
    type: 'QUOTA',
    status: 'success',
    reason: {
      quotaReason,
    },
    token,
  };
}

function quotaFailOpen(quotaReason: QuotaReason): CheckQuotaResponse {
  return {
    type: 'QUOTA',
    status: 'failOpen',
    reason: {
      quotaReason,
    },
  };
}
