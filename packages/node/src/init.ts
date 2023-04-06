import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { createHubService } from './hubService'
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
  const clientId = generateClientId()

  try {
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
      client id: ${clientId},
      service config: ${JSON.stringify(serviceConfig, undefined, 2)}
  `)
  } catch (e) {
    console.warn('Failed to fetch the service config:', e instanceof Error ? e.message : e)
  }
}
