import { type Mock, vi } from 'vitest'
import { updateHubService } from '../../global/hubService'
import { type HubService } from '../../hub/hubService'

const hubServiceMockMethod = <TMethod extends keyof HubService>(implementation: (...args: Parameters<HubService[TMethod]>) => ReturnType<HubService[TMethod]>) => Object.assign(vi.fn<Parameters<HubService[TMethod]>, ReturnType<HubService[TMethod]>>(implementation), {
  mockImplementationDeferred: function (this: Mock<Parameters<HubService[TMethod]>, ReturnType<HubService[TMethod]>>) {
    const deferred: {
      resolve: (value: Awaited<ReturnType<HubService[TMethod]>>) => void
      reject: (reason: unknown) => void
    } = {
      resolve: () => {},
      reject: () => {}
    }
    this.mockImplementation((): any => {
      return new Promise<ReturnType<HubService[TMethod]>>((resolve, reject) => {
        deferred.resolve = resolve
        deferred.reject = reject
      })
    })

    return deferred
  }
})

const getServiceMetadataMock = hubServiceMockMethod<'getServiceMetadata'>(() => ({
  serviceName: 'mockService',
  environment: 'mockEnvironment',
  clientId: 'mockClientId'
}))
const fetchServiceConfigMock = hubServiceMockMethod<'fetchServiceConfig'>(async () => new Promise<never>(() => {}))
const fetchDecoratorConfigMock = hubServiceMockMethod<'fetchDecoratorConfig'>(async () => new Promise<never>(() => {}))
const getTokenMock = hubServiceMockMethod<'getToken'>(async () => new Promise<never>(() => {}))
const getTokenLeaseMock = hubServiceMockMethod<'getTokenLease'>(async () => new Promise<never>(() => {}))
const validateTokenMock = hubServiceMockMethod<'validateToken'>(async () => new Promise<never>(() => {}))
const markTokensAsConsumedMock = hubServiceMockMethod<'markTokensAsConsumed'>(async () => new Promise<never>(() => {}))

export const mockHubService = {
  getServiceMetadata: getServiceMetadataMock,
  fetchServiceConfig: fetchServiceConfigMock,
  fetchDecoratorConfig: fetchDecoratorConfigMock,
  getToken: getTokenMock,
  getTokenLease: getTokenLeaseMock,
  validateToken: validateTokenMock,
  markTokensAsConsumed: markTokensAsConsumedMock,
  reset: () => {
    getServiceMetadataMock.mockReset()
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

    updateHubService(mockHubService)
  }
} satisfies HubService & { reset: () => void }
