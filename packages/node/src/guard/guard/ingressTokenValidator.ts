import { getGuardConfig } from '../../global/guardConfig'
import { context } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../../context/stanzaTokenContextKey'
import { StanzaGuardError } from '../stanzaGuardError'
import { type ValidatedToken } from '../../hub/model'
import { withTimeout } from '../../utils/withTimeout'
import { hubService } from '../../global/hubService'
import { logger } from '../../global/logger'
import { STANZA_REQUEST_TIMEOUT } from '../../global/requestTimeout'

export interface IngressTokenValidatorOptions {
  guard: string
}
export const initIngressTokenValidator = (options: IngressTokenValidatorOptions) => {
  return { shouldValidateIngressToken, validateIngressToken }

  function shouldValidateIngressToken (): boolean {
    const guardConfig = getGuardConfig(options.guard)
    return guardConfig?.config?.validateIngressTokens === true
  }

  async function validateIngressToken (): Promise<{ type: 'TOKEN_VALIDATED' } | null> {
    const token = context.active().getValue(stanzaTokenContextKey)

    if (typeof (token) !== 'string' || token === '') {
      throw new StanzaGuardError('InvalidToken', 'Valid Stanza token was not provided in the incoming header')
    }

    let validatedToken: ValidatedToken | null = null
    try {
      validatedToken = await withTimeout(
        STANZA_REQUEST_TIMEOUT,
        'Validate token timed out',
        hubService.validateToken({
          guard: options.guard,
          token
        }))
    } catch (e) {
      logger.warn('Failed to validate the token: %o', e instanceof Error ? e.message : e)
    }

    if (validatedToken === null) {
      return null
    }

    if (!validatedToken.valid || validatedToken.token !== token) {
      throw new StanzaGuardError('InvalidToken', 'Provided token was invalid')
    }

    return { type: 'TOKEN_VALIDATED' }
  }
}
