import { type StanzaInitOptions } from './stanzaInitOptions'

type StanzaInitOptionsFromEnv = Exclude<keyof StanzaInitOptions, 'useRestHubApi'>

const stanzaEnvOptionsMap: Record<StanzaInitOptionsFromEnv, string> = {
  hubUrl: 'STANZA_HUB_ADDRESS',
  apiKey: 'STANZA_API_KEY',
  serviceName: 'STANZA_SERVICE_NAME',
  serviceRelease: 'STANZA_SERVICE_RELEASE',
  environment: 'STANZA_ENVIRONMENT'
}
export const getEnvInitOptions = (): Partial<StanzaInitOptions> => {
  return (Object.entries(stanzaEnvOptionsMap) as Array<[StanzaInitOptionsFromEnv, string]>).reduce<Partial<StanzaInitOptions>>((resultOptions, [optionKey, envKey]) => {
    resultOptions[optionKey] = process.env[envKey]
    return resultOptions
  }, {})
}
