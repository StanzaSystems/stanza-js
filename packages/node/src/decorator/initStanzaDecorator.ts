import { context } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'
import { getDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type StanzaToken, type ValidatedTokens } from '../hub/model'
import { withTimeout } from '../utils/withTimeout'
import { type StanzaDecoratorOptions } from './model'
import { StanzaDecoratorError } from './stanzaDecoratorError'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'

const CHECK_QUOTA_TIMEOUT = 1000

export const initDecorator = (options: StanzaDecoratorOptions) => {
  const shouldCheckQuota = (): boolean => {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }

  const shouldValidateIngressToken = (): boolean => {
    const decoratorConfig = getDecoratorConfig(options.decorator)
    return decoratorConfig?.config?.validateIngressTokens === true
  }
  startPollingDecoratorConfig(options.decorator)
  return { guard }

  async function guard (): Promise<{ type: 'TOKEN_GRANTED', token: string } | { type: 'TOKEN_VALIDATED' } | null> {
    if (shouldCheckQuota()) {
      let token: StanzaToken | null = null
      try {
        token = await withTimeout(
          CHECK_QUOTA_TIMEOUT,
          'Check quota timed out',
          hubService.getToken(options)
        )
      } catch (e) {
        console.warn('Failed to fetch the token:', e instanceof Error ? e.message : e)
      }
      if (token?.granted === false) {
        throw new StanzaDecoratorError('NoQuota', 'Decorator can not be executed')
      }

      return token?.granted ? { type: 'TOKEN_GRANTED', token: token.token } : null
    }

    if (shouldValidateIngressToken()) {
      const token = context.active().getValue(stanzaTokenContextKey)

      if (typeof (token) !== 'string' || token === '') {
        throw new StanzaDecoratorError('InvalidToken', 'Valid Stanza token was not provided')
      }

      let validatedTokens: ValidatedTokens | null = null
      try {
        validatedTokens = await withTimeout(
          CHECK_QUOTA_TIMEOUT,
          'Validate token timed out',
          hubService.validateToken({
            decorator: options.decorator,
            token
          }))
      } catch (e) {
        console.warn('Failed to validate the token:', e instanceof Error ? e.message : e)
      }

      if (validatedTokens === null) {
        return null
      }

      if (!validatedTokens.some(({ token: validatedToken, valid }) => token === validatedToken && valid)) {
        throw new StanzaDecoratorError('InvalidToken', 'Provided token was invalid')
      }

      return { type: 'TOKEN_VALIDATED' }
    }

    return null
  }
}
