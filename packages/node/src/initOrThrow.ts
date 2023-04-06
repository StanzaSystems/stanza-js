import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { createHubService } from './hubService'
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
  const clientId = generateClientId()

  const hubService = createHubService(initOptions.hubUrl, initOptions.apiKey)
  const serviceConfig = await hubService.fetchServiceConfig({
    serviceName: initOptions.serviceName,
    serviceRelease: initOptions.serviceRelease,
    environment: initOptions.environment
  })

  console.log(`
    Stanza successfully initialized:
      environment: ${initOptions.environment}
      service name: ${initOptions.serviceName}
      service release: ${initOptions.serviceRelease}
      client id: ${clientId}
      service config: ${JSON.stringify(serviceConfig)}
`)
}
