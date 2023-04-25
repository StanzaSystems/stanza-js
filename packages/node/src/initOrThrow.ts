import { addInstrumentation } from './addInstrumentation'
import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { updateHubService } from './global/hubService'
import { createHubService } from './hub/hubService'
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions'
import { startPollingServiceConfig } from './startPollingConfigService'

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
    environment: initOptions.environment,
    clientId
  }))

  startPollingServiceConfig()
}
