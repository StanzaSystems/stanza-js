import { initQuotaChecker } from './quotaChecker'
import { initIngressTokenValidator } from './ingressTokenValidator'
import { type StanzaGuardOptions } from '../model'
import { addServiceConfigListener, isServiceConfigInitialized } from '../../global/serviceConfig'
import { type ReasonData } from '../../global/eventBus'

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
        shouldRun: shouldValidateIngressToken,
        run: validateIngressToken,
        notRun: (): Awaited<ReturnType<typeof validateIngressToken>> => ({
          type: 'TOKEN_VALIDATE',
          status: 'disabled',
          reason: {
            tokenReason: 'TOKEN_EVAL_DISABLED'
          }
        })
      },
      {
        shouldRun: shouldCheckQuota,
        run: checkQuota,
        notRun: (): Awaited<ReturnType<typeof checkQuota>> => ({
          type: 'QUOTA',
          status: 'disabled',
          reason: {
            quotaReason: 'QUOTA_EVAL_DISABLED'
          }
        })
      }
    ]

    const results = Array<Awaited<ReturnType<(typeof guardSteps)[number]['run']>>>()
    for (const { shouldRun, run, notRun } of guardSteps) {
      if (shouldRun()) {
        const result = await run()
        results.push(result)
      } else {
        results.push(notRun())
      }
    }

    return results
  }
}
