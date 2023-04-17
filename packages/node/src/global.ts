import { type HubService } from './hub/hubService'

const notInitializedServiceMethod = async () => Promise.reject(new Error('Hub Service not initialized yet'))
export let hubService: HubService = {
  fetchServiceConfig: notInitializedServiceMethod,
  fetchDecoratorConfig: notInitializedServiceMethod,
  getToken: notInitializedServiceMethod
}

export const updateHubService = (updatedService: HubService) => {
  hubService = updatedService
}
