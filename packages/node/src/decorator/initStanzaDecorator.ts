import { context } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'
import { getDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type ValidatedToken } from '../hub/model'
import { getQuota } from '../quota/getQuota'
import { withTimeout } from '../utils/withTimeout'
import { type StanzaDecoratorOptions } from './model'
import { StanzaDecoratorError } from './stanzaDecoratorError'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'

const VALIDATE_QUOTA_TIMEOUT = 1000

export const initDecorator = (options: StanzaDecoratorOptions) => {
  startPollingDecoratorConfig(options.decorator)
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

  function shouldCheckQuota (): boolean {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }

  function shouldValidateIngressToken (): boolean {
    const decoratorConfig = getDecoratorConfig(options.decorator)
    return decoratorConfig?.config?.validateIngressTokens === true
  }

  async function checkQuota (): Promise<{ type: 'TOKEN_GRANTED', token: string } | null> {
    const token = await getQuota(options)
    if (token?.granted === false) {
      throw new StanzaDecoratorError('NoQuota', 'Decorator can not be executed')
    }

    return token?.granted ? { type: 'TOKEN_GRANTED', token: token.token } : null
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
      console.warn('Failed to validate the token:', e instanceof Error ? e.message : e)
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
