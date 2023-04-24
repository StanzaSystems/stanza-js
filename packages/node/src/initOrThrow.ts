import { addInstrumentation } from './addInstrumentation'
import { fetchServiceConfig } from './fetchServiceConfig'
import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { updateHubService } from './global'
import { createHubService } from './hub/hubService'
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions'
import { startPolling } from './startPolling'

export const initOrThrow = async (options: Partial<StanzaInitOptions> = {}) => {
  const parseResult = stanzaInitOptions.safeParse({
    ...getEnvInitOptions(),
    ...options
  })

  if (!parseResult.success) {
    throw new TypeError('Provided options are invalid')
  }
  const initOptions = parseResult.data
  const clientId = generateClientId()

  await addInstrumentation(initOptions.serviceName)

  updateHubService(createHubService({
    hubUrl: initOptions.hubUrl,
    apiKey: initOptions.apiKey,
    serviceName: initOptions.serviceName,
    serviceRelease: initOptions.serviceRelease,
    environment: initOptions.environment
  }))

  startPolling(fetchServiceConfig, { pollInterval: 15000 })

  console.log(`
      Stanza successfully initialized:
        environment: ${initOptions.environment}
        service name: ${initOptions.serviceName}
        service release: ${initOptions.serviceRelease}
        client id: ${clientId}
  `)
}
