import { initQuotaChecker } from './quotaChecker'
import { initIngressTokenValidator } from './ingressTokenValidator'
import { type StanzaGuardOptions } from '../model'
import { addServiceConfigListener, isServiceConfigInitialized } from '../../global/serviceConfig'
import { getGuardConfig } from '../../global/guardConfig'

type GuardGuardOptions = StanzaGuardOptions

export const initGuardGuard = (options: GuardGuardOptions) => {
  const { shouldCheckQuota, checkQuota } = initQuotaChecker(options)
  const { shouldValidateIngressToken, validateIngressToken } = initIngressTokenValidator(options)

  return { guard }

  async function guard () {
    if (!isServiceConfigInitialized()) {
      await new Promise<void>(resolve => {
        const unsubscribe = addServiceConfigListener(() => {
          resolve()
          unsubscribe()
        })
      })
    }

    const guardSteps = [
      {
        isEnabled: shouldValidateIngressToken,
        canEval: () => getGuardConfig(options.guard) !== undefined,
        onEnabled: validateIngressToken,
        onNoEval: (): Awaited<ReturnType<typeof validateIngressToken>> => ({
          type: 'TOKEN_VALIDATE',
          status: 'failOpen',
          reason: {
            tokenReason: 'TOKEN_NOT_EVAL'
          }
        }),
        onDisabled: (): Awaited<ReturnType<typeof validateIngressToken>> => ({
          type: 'TOKEN_VALIDATE',
          status: 'disabled',
          reason: {
            tokenReason: 'TOKEN_EVAL_DISABLED'
          }
        }),
        onError: (): Awaited<ReturnType<typeof validateIngressToken>> => ({
          type: 'TOKEN_VALIDATE',
          status: 'failOpen',
          reason: {
            tokenReason: 'TOKEN_VALIDATION_ERROR'
          }
        })
      },
      {
        isEnabled: shouldCheckQuota,
        canEval: () => getGuardConfig(options.guard) !== undefined,
        onEnabled: checkQuota,
        onNoEval: (): Awaited<ReturnType<typeof checkQuota>> => ({
          type: 'QUOTA',
          status: 'failOpen',
          reason: {
            quotaReason: 'QUOTA_NOT_EVAL'
          }
        }),
        onDisabled: (): Awaited<ReturnType<typeof checkQuota>> => ({
          type: 'QUOTA',
          status: 'disabled',
          reason: {
            quotaReason: 'QUOTA_EVAL_DISABLED'
          }
        }),
        onError: (): Awaited<ReturnType<typeof checkQuota>> => ({
          type: 'QUOTA',
          status: 'failOpen',
          reason: {
            quotaReason: 'QUOTA_LOCAL_ERROR'
          }
        })
      }
    ]

    type GuardCheckResult = Awaited<ReturnType<(typeof guardSteps)[number]['onEnabled']>>
    const results = Array<GuardCheckResult>()
    for (const { isEnabled, onEnabled, onDisabled, canEval, onNoEval, onError } of guardSteps) {
      let stepResult: GuardCheckResult
      try {
        stepResult = !canEval()
          ? onNoEval()
          : isEnabled()
            ? await onEnabled()
            : onDisabled()
      } catch (e) {
        stepResult = onError()
      }
      results.push(stepResult)
      if (stepResult.status === 'failure') break
    }

    return results
  }
}
