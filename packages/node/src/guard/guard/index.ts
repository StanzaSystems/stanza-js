import { initQuotaChecker } from './quotaChecker'
import { initIngressTokenValidator } from './ingressTokenValidator'
import { type StanzaGuardOptions } from '../model'
import { addServiceConfigListener, isServiceConfigInitialized } from '../../global/serviceConfig'

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
        run: validateIngressToken
      },
      {
        shouldRun: shouldCheckQuota,
        run: checkQuota
      }
    ]

    const results = Array<Awaited<ReturnType<(typeof guardSteps)[number]['run']>>>()
    for (const { shouldRun, run } of guardSteps) {
      if (shouldRun()) {
        const result = await run()
        results.push(result)
      }
    }

    return results
  }
}
