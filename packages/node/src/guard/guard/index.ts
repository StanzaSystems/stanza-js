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

    if (shouldValidateIngressToken()) {
      const validateIngressTokenResult = await validateIngressToken()

      if (shouldCheckQuota()) {
        const checkQuotaResult = await checkQuota()

        return [validateIngressTokenResult, checkQuotaResult]
      }
      return [validateIngressTokenResult]
    }

    if (shouldCheckQuota()) {
      const checkQuotaResult = await checkQuota()
      return [checkQuotaResult]
    }

    return []
  }
}
