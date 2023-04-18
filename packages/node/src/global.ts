import { type HubService } from './hub/hubService'

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace global {
  let hubService: HubService | undefined
}

const notInitializedServiceMethod = async () => Promise.reject(new Error('Hub Service not initialized yet'))
export let hubService: HubService = global.hubService = global.hubService ?? {
  fetchServiceConfig: notInitializedServiceMethod,
  fetchDecoratorConfig: notInitializedServiceMethod,
  getToken: notInitializedServiceMethod
}

export const updateHubService = (updatedService: HubService) => {
  hubService = global.hubService = updatedService
}
