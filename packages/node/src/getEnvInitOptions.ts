import { type StanzaInitOptions } from './stanzaInitOptions'
import { type CoerceFn, coerceStringToInteger } from './coerceStanzaInitOptions'
import { identity } from '@getstanza/core'

type StanzaInitOptionsFromEnv = Exclude<keyof StanzaInitOptions, 'useRestHubApi'>

const stanzaEnvOptionsMap: {
  [P in StanzaInitOptionsFromEnv]: [string, CoerceFn<P>]
} = {
  hubUrl: ['STANZA_HUB_ADDRESS', identity],
  apiKey: ['STANZA_API_KEY', identity],
  serviceName: ['STANZA_SERVICE_NAME', identity],
  serviceRelease: ['STANZA_SERVICE_RELEASE', identity],
  environment: ['STANZA_ENVIRONMENT', identity],
  requestTimeout: ['STANZA_REQUEST_TIMEOUT', coerceStringToInteger]
}
export const getEnvInitOptions = (): Partial<StanzaInitOptions> => {
  return (Object.entries(stanzaEnvOptionsMap) as Array<[StanzaInitOptionsFromEnv, [string, CoerceFn<any>]]>).reduce<Partial<StanzaInitOptions>>((resultOptions, [optionKey, [envKey, coerceFn]]) => {
    resultOptions[optionKey] = coerceFn(process.env[envKey])
    return resultOptions
  }, {})
}
