import { initQuotaChecker } from './quotaChecker'
import { initIngressTokenValidator } from './ingressTokenValidator'
import { type StanzaDecoratorOptions } from '../model'

type DecoratorGuardOptions = StanzaDecoratorOptions

export const initDecoratorGuard = (options: DecoratorGuardOptions) => {
  const { shouldCheckQuota, checkQuota } = initQuotaChecker(options)
  const { shouldValidateIngressToken, validateIngressToken } = initIngressTokenValidator(options)

  return { guard }

  async function guard () {
    if (shouldValidateIngressToken()) {
      return validateIngressToken()
    }

    if (shouldCheckQuota()) {
      return checkQuota()
    }

    return null
  }
}
