import { addInstrumentation } from './addInstrumentation'
import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { updateHubService } from './global/hubService'
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions'
import { startPollingServiceConfig } from './service/startPollingConfigService'
import { createGrpcHubService } from './hub/grpc/createGrpcHubService'
import { createHubRequest } from './hub/rest/createHubRequest'
import { createRestHubService } from './hub/rest/createRestHubService'
import { setRequestTimeout } from './global/requestTimeout'
import { setSkipTokenCache } from './global/skipTokenCache'
import { logger } from './global/logger'

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

  setRequestTimeout(initOptions.requestTimeout)
  setSkipTokenCache(initOptions.skipTokenCache)
  if (initOptions.logLevel !== undefined) {
    logger.level = initOptions.logLevel
  }

  await addInstrumentation(initOptions.serviceName)

  updateHubService(
    initOptions.useRestHubApi
      ? createRestHubService({
        serviceName: initOptions.serviceName,
        serviceRelease: initOptions.serviceRelease,
        environment: initOptions.environment,
        clientId,
        hubRequest: createHubRequest({
          hubUrl: initOptions.hubUrl,
          apiKey: initOptions.apiKey
        })
      })
      : createGrpcHubService({
        serviceName: initOptions.serviceName,
        serviceRelease: initOptions.serviceRelease,
        environment: initOptions.environment,
        clientId,
        hubUrl: initOptions.hubUrl,
        apiKey: initOptions.apiKey
      }))

  startPollingServiceConfig()
}
