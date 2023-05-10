import { vi } from 'vitest'
import { updateHubService } from '../../global/hubService'
import { type HubService } from '../../hub/hubService'

const hubServiceMockMethod = <TMethod extends keyof HubService>(implementation: (...args: Parameters<HubService[TMethod]>) => ReturnType<HubService[TMethod]>) => vi.fn<Parameters<HubService[TMethod]>, ReturnType<HubService[TMethod]>>(implementation)

const fetchServiceConfigMock = hubServiceMockMethod<'fetchServiceConfig'>(async () => new Promise<never>(() => {}))
const fetchDecoratorConfigMock = hubServiceMockMethod<'fetchDecoratorConfig'>(async () => new Promise<never>(() => {}))
const getTokenMock = hubServiceMockMethod<'getToken'>(async () => new Promise<never>(() => {}))
const getTokenLeaseMock = hubServiceMockMethod<'getTokenLease'>(async () => new Promise<never>(() => {}))
const validateTokenMock = hubServiceMockMethod<'validateToken'>(async () => new Promise<never>(() => {}))
const markTokensAsConsumedMock = hubServiceMockMethod<'markTokensAsConsumed'>(async () => new Promise<never>(() => {}))

export const mockHubService = {
  fetchServiceConfig: fetchServiceConfigMock,
  fetchDecoratorConfig: fetchDecoratorConfigMock,
  getToken: getTokenMock,
  getTokenLease: getTokenLeaseMock,
  validateToken: validateTokenMock,
  markTokensAsConsumed: markTokensAsConsumedMock,
  reset: () => {
    fetchServiceConfigMock.mockReset()
    fetchDecoratorConfigMock.mockReset()
    getTokenMock.mockReset()
    getTokenLeaseMock.mockReset()
    validateTokenMock.mockReset()
    markTokensAsConsumedMock.mockReset()

    fetchServiceConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
    fetchDecoratorConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
    getTokenMock.mockImplementation(async () => new Promise<never>(() => {}))
    getTokenLeaseMock.mockImplementation(async () => new Promise<never>(() => {}))
    validateTokenMock.mockImplementation(async () => new Promise<never>(() => {}))
    markTokensAsConsumedMock.mockImplementation(async () => new Promise<never>(() => {}))

    updateHubService({
      fetchServiceConfig: fetchServiceConfigMock,
      fetchDecoratorConfig: fetchDecoratorConfigMock,
      getToken: getTokenMock,
      getTokenLease: getTokenLeaseMock,
      validateToken: validateTokenMock,
      markTokensAsConsumed: markTokensAsConsumedMock
    })
  }
} satisfies HubService & { reset: () => void }
