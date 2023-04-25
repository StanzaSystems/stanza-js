import { addInstrumentation } from './addInstrumentation'
import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { hubService, updateHubService } from './global'
import { createHubService } from './hub/hubService'
import { updateServiceConfig } from './serviceConfig'
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
    await addInstrumentation(initOptions.serviceName)

    updateHubService(createHubService({
      hubUrl: initOptions.hubUrl,
      apiKey: initOptions.apiKey,
      serviceName: initOptions.serviceName,
      serviceRelease: initOptions.serviceRelease,
      environment: initOptions.environment
    }))
    const serviceConfig = await hubService.fetchServiceConfig()

    console.log(`
    Stanza successfully initialized:
      environment: ${initOptions.environment}
      service name: ${initOptions.serviceName}
      service release: ${initOptions.serviceRelease}
      client id: ${clientId},
      service config: ${JSON.stringify(serviceConfig, undefined, 2)}
  `)
    serviceConfig !== null && updateServiceConfig(serviceConfig)
  } catch (e) {
    console.warn('Failed to fetch the service config:', e instanceof Error ? e.message : e)
  }
}
