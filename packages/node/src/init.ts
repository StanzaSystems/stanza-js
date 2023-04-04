import { getEnvInitOptions } from './getEnvInitOptions'
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions'

export const init = async (options: Partial<StanzaInitOptions> = {}) => {
  const parseResult = stanzaInitOptions.safeParse({
    ...getEnvInitOptions(),
    ...options
  })

  if (!parseResult.success) {
    console.warn('Provided options are invalid')
    return
  }
  const initOptions = parseResult.data

  console.log(`
    Stanza successfully initialized:
      environment: ${initOptions.environment}
      service name: ${initOptions.serviceName}
      service release: ${initOptions.serviceRelease}
  `)
}
