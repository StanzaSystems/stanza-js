import { addInstrumentation } from './addInstrumentation'
import { generateClientId } from './generateClientId'
import { getEnvInitOptions } from './getEnvInitOptions'
import { updateHubService } from './global/hubService'
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions'
import { startPollingServiceConfig } from './service/startPollingConfigService'
import { createGrpcHubService } from './hub/grpc/createGrpcHubService'

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

  // const hubRequest = createHubRequest({
  //   hubUrl: initOptions.hubUrl,
  //   apiKey: initOptions.apiKey
  // })
  // updateHubService(createHubService({
  //   serviceName: initOptions.serviceName,
  //   serviceRelease: initOptions.serviceRelease,
  //   environment: initOptions.environment,
  //   clientId,
  //   hubRequest
  // }))
  updateHubService(createGrpcHubService({
    serviceName: initOptions.serviceName,
    serviceRelease: initOptions.serviceRelease,
    environment: initOptions.environment,
    clientId,
    hubUrl: initOptions.hubUrl,
    apiKey: initOptions.apiKey
  }))

  startPollingServiceConfig()
}
