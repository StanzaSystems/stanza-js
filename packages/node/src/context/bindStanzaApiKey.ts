import * as oTelApi from '@opentelemetry/api'
import { stanzaApiKeyContextKey } from './stanzaApiKeyContextKey'

export const bindStanzaApiKey = <Fn extends (...args: any[]) => unknown>(token: string, fn: Fn): (...args: Parameters<Fn>) => ReturnType<Fn> => {
  const activeContext = oTelApi.context.active()
  return oTelApi.context.bind(activeContext.setValue(stanzaApiKeyContextKey, token), fn as (...args: Parameters<Fn>) => ReturnType<Fn>)
}
