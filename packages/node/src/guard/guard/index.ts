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
        })
      }
    ]

    const results = Array<Awaited<ReturnType<(typeof guardSteps)[number]['onEnabled']>>>()
    for (const { isEnabled, onEnabled, onDisabled, canEval, onNoEval } of guardSteps) {
      if (!canEval()) {
        results.push(onNoEval())
      } else if (isEnabled()) {
        const result = await onEnabled()
        results.push(result)
        if (result.status === 'failure') break
      } else {
        results.push(onDisabled())
      }
    }

    return results
  }
}
