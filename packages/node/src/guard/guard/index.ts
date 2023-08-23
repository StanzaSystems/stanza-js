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
      return validateIngressToken()
    }

    if (shouldCheckQuota()) {
      return checkQuota()
    }

    return null
  }
}
