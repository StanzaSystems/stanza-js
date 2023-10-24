import { type HubService } from '../hub/hubService'

const HUB_SERVICE_SYMBOL = Symbol.for('[Stanza SDK Internal] Hub Service')

interface HubServiceGlobal { [HUB_SERVICE_SYMBOL]: HubService | undefined }
const hubServiceGlobal = global as unknown as HubServiceGlobal

const notInitializedServiceMethod = async () => Promise.reject(new Error('Hub Service not initialized yet'))
const notInitializedSyncServiceMethod = (): never => {
  throw (new Error('Hub Service not initialized yet'))
}
export let hubService: HubService = hubServiceGlobal[HUB_SERVICE_SYMBOL] = hubServiceGlobal[HUB_SERVICE_SYMBOL] ?? {
  getServiceMetadata: notInitializedSyncServiceMethod,
  fetchServiceConfig: notInitializedServiceMethod,
  fetchGuardConfig: notInitializedServiceMethod,
  getToken: notInitializedServiceMethod,
  getTokenLease: notInitializedServiceMethod,
  validateToken: notInitializedServiceMethod,
  markTokensAsConsumed: notInitializedServiceMethod,
  getAuthToken: notInitializedServiceMethod,
  getGuardHealth: notInitializedServiceMethod
} satisfies HubService

export const updateHubService = (updatedService: HubService) => {
  hubService = hubServiceGlobal[HUB_SERVICE_SYMBOL] = updatedService
}
