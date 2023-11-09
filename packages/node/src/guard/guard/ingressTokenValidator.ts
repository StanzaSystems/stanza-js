import { getGuardConfig } from '../../global/guardConfig'
import { context } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../../context/stanzaTokenContextKey'
import { type ValidatedToken } from '../../hub/model'
import { withTimeout } from '../../utils/withTimeout'
import { hubService } from '../../global/hubService'
import { logger } from '../../global/logger'
import { STANZA_REQUEST_TIMEOUT } from '../../global/requestTimeout'
import { type ReasonData } from '../../global/eventBus'
import { type CheckerResponse } from './types'

export interface IngressTokenValidatorOptions {
  guard: string
}

type TokenValidateResponse = CheckerResponse<'TOKEN_VALIDATE', Record<string, unknown>, { message: string }> & {
  reason: Pick<ReasonData, 'tokenReason'>
}
export const initIngressTokenValidator = (options: IngressTokenValidatorOptions) => {
  return { shouldValidateIngressToken, validateIngressToken }

  function shouldValidateIngressToken (): boolean {
    const guardConfig = getGuardConfig(options.guard)
    return guardConfig?.config?.validateIngressTokens === true
  }

  async function validateIngressToken (): Promise<TokenValidateResponse> {
    const token = context.active().getValue(stanzaTokenContextKey)

    if (typeof (token) !== 'string' || token === '') {
      return { type: 'TOKEN_VALIDATE', status: 'failure', reason: { tokenReason: 'TOKEN_NOT_VALID' }, message: 'Valid Stanza token was not provided in the incoming header' }
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
      return { type: 'TOKEN_VALIDATE', status: 'failOpen', reason: { tokenReason: 'TOKEN_VALIDATION_ERROR' } }
    }

    if (!validatedToken.valid || validatedToken.token !== token) {
      return { type: 'TOKEN_VALIDATE', status: 'failure', reason: { tokenReason: 'TOKEN_NOT_VALID' }, message: 'Provided token was invalid' }
    }

    return {
      type: 'TOKEN_VALIDATE',
      status: 'success',
      reason: {
        tokenReason: 'TOKEN_VALID'
      }
    }
  }
}
