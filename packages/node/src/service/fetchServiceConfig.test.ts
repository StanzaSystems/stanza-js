import { mockHubService } from '../__tests__/mocks/mockHubService'
import { fetchServiceConfig } from './fetchServiceConfig'
import { type updateServiceConfig, type isServiceConfigInitialized } from '../global/serviceConfig'
import { type ServiceConfig } from '../hub/model'

type UpdateServiceConfig = typeof updateServiceConfig
type IsServiceConfigInitialized = typeof isServiceConfigInitialized
const updateServiceConfigMock = vi.fn<Parameters<UpdateServiceConfig>, ReturnType<UpdateServiceConfig>>()
const isServiceConfigInitializedMock = vi.fn<Parameters<IsServiceConfigInitialized>, ReturnType<IsServiceConfigInitialized>>()
vi.mock('../global/serviceConfig', () => {
  return {
    updateServiceConfig: ((...args) => updateServiceConfigMock(...args)) satisfies UpdateServiceConfig,
    isServiceConfigInitialized: ((...args) => isServiceConfigInitializedMock(...args)) satisfies IsServiceConfigInitialized
  }
})

const mockServiceConfig: ServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: []
    },
    metricConfig: {
      collectorUrl: 'https://test.collector'
    },
    sentinelConfig: {
      circuitbreakerRulesJson: 'circuitbreakerRulesJson',
      flowRulesJson: 'flowRulesJson',
      isolationRulesJson: 'isolationRulesJson',
      systemRulesJson: 'systemRulesJson'
    }
  }
}

beforeEach(() => {
  mockHubService.reset()
  updateServiceConfigMock.mockReset()
  isServiceConfigInitializedMock.mockReset()
  isServiceConfigInitializedMock.mockImplementation(() => false)
})

describe('fetchServiceConfig', () => {
  it('should call hub service without params', () => {
    void fetchServiceConfig()

    expect(mockHubService.fetchServiceConfig).toHaveBeenCalledOnce()
    expect(mockHubService.fetchServiceConfig).toHaveBeenCalledWith(undefined)
  })

  it('should call hub service with correct params', () => {
    void fetchServiceConfig({ lastVersionSeen: '1' })

    expect(mockHubService.fetchServiceConfig).toHaveBeenCalledOnce()
    expect(mockHubService.fetchServiceConfig).toHaveBeenCalledWith({ lastVersionSeen: '1' })
  })

  it('should update service config if hub returns value - and service config not initialized', async () => {
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.resolve(mockServiceConfig)

    await expect(fetchServiceConfigPromise).resolves.toBeDefined()

    expect(updateServiceConfigMock).toHaveBeenCalledOnce()
  })

  it('should update service config if hub returns value - and service config initialized', async () => {
    isServiceConfigInitializedMock.mockImplementation(() => true)
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.resolve(mockServiceConfig)

    await expect(fetchServiceConfigPromise).resolves.toBeDefined()

    expect(updateServiceConfigMock).toHaveBeenCalledOnce()
  })

  it('should update service config if hub returns null - and service config not initialized', async () => {
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.resolve(null)

    await expect(fetchServiceConfigPromise).resolves.toBeDefined()

    expect(updateServiceConfigMock).toHaveBeenCalledOnce()
  })

  it('should not update service config if hub returns null - and service config initialized', async () => {
    isServiceConfigInitializedMock.mockImplementation(() => true)
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.resolve(null)

    await expect(fetchServiceConfigPromise).resolves.toBeDefined()

    expect(updateServiceConfigMock).not.toHaveBeenCalled()
  })

  it('should update service config if hub request rejects - and service config not initialized', async () => {
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.reject(new Error('kaboom'))

    await expect(fetchServiceConfigPromise).rejects.toThrow()

    expect(updateServiceConfigMock).toHaveBeenCalledOnce()
  })

  it('should not update service config if hub request rejects - and service config initialized', async () => {
    isServiceConfigInitializedMock.mockImplementation(() => true)
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.reject(new Error('kaboom'))

    await expect(fetchServiceConfigPromise).rejects.toThrow()

    expect(updateServiceConfigMock).not.toHaveBeenCalled()
  })

  it('should reject if hub request rejects', async () => {
    isServiceConfigInitializedMock.mockImplementation(() => true)
    const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()
    const fetchServiceConfigPromise = fetchServiceConfig()

    deferred.reject(new Error('kaboom'))

    await expect(fetchServiceConfigPromise).rejects.toThrow(new Error('kaboom'))

    expect(updateServiceConfigMock).not.toHaveBeenCalled()
  })
})
