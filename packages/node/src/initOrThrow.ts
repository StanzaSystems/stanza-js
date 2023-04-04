import { getEnvInitOptions } from './getEnvInitOptions'
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions'

export const initOrThrow = async (options: Partial<StanzaInitOptions> = {}) => {
  const parseResult = stanzaInitOptions.safeParse({
    ...getEnvInitOptions(),
    ...options
  })

  if (!parseResult.success) {
    throw new Error('Provided options are invalid')
  }
  const initOptions = parseResult.data

  console.log(`
    Stanza successfully initialized:
      environment: ${initOptions.environment}
      service name: ${initOptions.serviceName}
      service release: ${initOptions.serviceRelease}
  `)
}
