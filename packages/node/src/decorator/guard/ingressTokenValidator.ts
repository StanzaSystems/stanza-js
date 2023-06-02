import { getDecoratorConfig } from '../../global/decoratorConfig'
import { context } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../../context/stanzaTokenContextKey'
import { StanzaDecoratorError } from '../stanzaDecoratorError'
import { type ValidatedToken } from '../../hub/model'
import { withTimeout } from '../../utils/withTimeout'
import { hubService } from '../../global/hubService'
import { logger } from '../../global/logger'

const VALIDATE_QUOTA_TIMEOUT = 1000

export interface IngressTokenValidatorOptions {
  decorator: string
}
export const initIngressTokenValidator = (options: IngressTokenValidatorOptions) => {
  return { shouldValidateIngressToken, validateIngressToken }

  function shouldValidateIngressToken (): boolean {
    const decoratorConfig = getDecoratorConfig(options.decorator)
    return decoratorConfig?.config?.validateIngressTokens === true
  }

  async function validateIngressToken (): Promise<{ type: 'TOKEN_VALIDATED' } | null> {
    const token = context.active().getValue(stanzaTokenContextKey)

    if (typeof (token) !== 'string' || token === '') {
      throw new StanzaDecoratorError('InvalidToken', 'Valid Stanza token was not provided in the incoming header')
    }

    let validatedToken: ValidatedToken | null = null
    try {
      validatedToken = await withTimeout(
        VALIDATE_QUOTA_TIMEOUT,
        'Validate token timed out',
        hubService.validateToken({
          decorator: options.decorator,
          token
        }))
    } catch (e) {
      logger.warn('Failed to validate the token:', e instanceof Error ? e.message : e)
    }

    if (validatedToken === null) {
      return null
    }

    if (!validatedToken.valid || validatedToken.token !== token) {
      throw new StanzaDecoratorError('InvalidToken', 'Provided token was invalid')
    }

    return { type: 'TOKEN_VALIDATED' }
  }
}
