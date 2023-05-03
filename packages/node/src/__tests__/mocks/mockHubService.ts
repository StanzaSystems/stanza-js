import { vi } from 'vitest'
import { updateHubService } from '../../global/hubService'
import { type HubService } from '../../hub/hubService'
import { type DecoratorConfig, type ServiceConfig, type StanzaToken, type StanzaTokenLeases, type ValidatedTokens } from '../../hub/model'

const fetchServiceConfigMock = vi.fn<any[], Promise<ServiceConfig | null>>(async () => new Promise<never>(() => {}))
const fetchDecoratorConfigMock = vi.fn<any[], Promise<DecoratorConfig | null>>(async () => new Promise<never>(() => {}))
const getTokenMock = vi.fn<any[], Promise<StanzaToken | null>>(async () => new Promise<never>(() => {}))
const getTokenLeaseMock = vi.fn<any[], Promise<StanzaTokenLeases | null>>(async () => new Promise<never>(() => {}))
const validateTokenMock = vi.fn<Parameters<HubService['validateToken']>, Promise<ValidatedTokens | null>>(async () => new Promise<never>(() => {}))

export const mockHubService = {
  fetchServiceConfig: fetchServiceConfigMock,
  fetchDecoratorConfig: fetchDecoratorConfigMock,
  getToken: getTokenMock,
  getTokenLease: getTokenLeaseMock,
  validateToken: validateTokenMock,
  reset: () => {
    fetchServiceConfigMock.mockReset()
    fetchDecoratorConfigMock.mockReset()
    getTokenMock.mockReset()
    validateTokenMock.mockReset()

    fetchServiceConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
    fetchDecoratorConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
    getTokenMock.mockImplementation(async () => new Promise<never>(() => {}))
    validateTokenMock.mockImplementation(async () => new Promise<never>(() => {}))

    updateHubService({
      fetchServiceConfig: fetchServiceConfigMock,
      fetchDecoratorConfig: fetchDecoratorConfigMock,
      getToken: getTokenMock,
      getTokenLease: getTokenLeaseMock,
      validateToken: validateTokenMock
    })
  }
} satisfies HubService & { reset: () => void }
