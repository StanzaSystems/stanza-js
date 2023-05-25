import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGrpcHubService } from './createGrpcHubService'
import type * as connectNodeModule from '@bufbuild/connect'
import { type ConfigService } from '../../../gen/stanza/hub/v1/config_connect'
import { type QuotaService } from '../../../gen/stanza/hub/v1/quota_connect'
import { GetDecoratorConfigResponse, GetServiceConfigResponse } from '../../../gen/stanza/hub/v1/config_pb'

type ConnectNodeModule = typeof connectNodeModule

vi.mock('@bufbuild/connect', async (importOriginal) => {
  const original = await importOriginal<ConnectNodeModule>()
  return {
    ...original,
    createPromiseClient: (...args) => createPromiseClientMock(...args)
  } satisfies ConnectNodeModule
})

const createPromiseClientMock = vi.fn((() => {
  return {}
}) as ConnectNodeModule['createPromiseClient'])

const configClientMock = {
  getServiceConfig: vi.fn(),
  getDecoratorConfig: vi.fn(),
  getBrowserContext: vi.fn()
} satisfies connectNodeModule.PromiseClient<typeof ConfigService>

const quotaClientMock = {
  getToken: vi.fn(),
  getTokenLease: vi.fn(),
  setTokenLeaseConsumed: vi.fn(),
  validateToken: vi.fn()
} satisfies connectNodeModule.PromiseClient<typeof QuotaService>

beforeEach(async () => {
  createPromiseClientMock.mockReset()

  configClientMock.getServiceConfig.mockReset()
  configClientMock.getDecoratorConfig.mockReset()
  configClientMock.getBrowserContext.mockReset()

  quotaClientMock.getToken.mockReset()
  quotaClientMock.getTokenLease.mockReset()
  quotaClientMock.setTokenLeaseConsumed.mockReset()
  quotaClientMock.validateToken.mockReset()
})

describe('createGrpcHubService', async () => {
  describe('fetchServiceConfig', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { fetchServiceConfig } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'valid-api-key'
    })

    it('should call fetch with proper params', async () => {
      await fetchServiceConfig()

      expect(configClientMock.getServiceConfig).toHaveBeenCalledOnce()

      expect(configClientMock.getServiceConfig).toHaveBeenCalledWith(
        {
          service: { name: 'TestService', environment: 'test', release: '1' },
          versionSeen: undefined
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchServiceConfig({
        lastVersionSeen: '123'
      })

      expect(configClientMock.getServiceConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getServiceConfig).toHaveBeenCalledWith(
        {
          service: { name: 'TestService', environment: 'test', release: '1' },
          versionSeen: '123'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchServiceConfig()

      expect(result).toBeNull()
    })

    it('should return null if configDataSent is false', async () => {
      configClientMock.getServiceConfig.mockImplementation(async () => {
        return new GetServiceConfigResponse({
          version: '1',
          configDataSent: false
        })
      })

      const result = await fetchServiceConfig()

      expect(result).toBeNull()
    })

    it('should return config data if configDataSent is true', async () => {
      configClientMock.getServiceConfig.mockImplementation(async () => {
        return new GetServiceConfigResponse({
          version: '1',
          configDataSent: true,
          config: {
            traceConfig: {
              collectorUrl: 'https://url.to.trace.collector',
              collectorKey: 'trace-collector-key',
              overrides: [],
              sampleRateDefault: 0.5
            },
            metricConfig: {
              collectorUrl: 'https://url.to.metric.collector',
              collectorKey: 'metric-collector-key'
            },
            sentinelConfig: {
              circuitbreakerRulesJson: 'circuitbreakerRulesJson',
              flowRulesJson: 'flowRulesJson',
              isolationRulesJson: 'isolationRulesJson',
              systemRulesJson: 'systemRulesJson'
            }
          }
        })
      })

      const result = await fetchServiceConfig()

      expect(result).toEqual({
        version: '1',
        config: {
          traceConfig: {
            collectorUrl: 'https://url.to.trace.collector',
            collectorKey: 'trace-collector-key',
            overrides: [],
            sampleRateDefault: 0.5
          },
          metricConfig: {
            collectorUrl: 'https://url.to.metric.collector',
            collectorKey: 'metric-collector-key'
          },
          sentinelConfig: {
            circuitbreakerRulesJson: 'circuitbreakerRulesJson',
            flowRulesJson: 'flowRulesJson',
            isolationRulesJson: 'isolationRulesJson',
            systemRulesJson: 'systemRulesJson'
          }
        }
      })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      configClientMock.getServiceConfig.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void fetchServiceConfig().catch((e) => {
        console.log(e)
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)
    })
  })

  describe('fetchDecoratorConfig', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { fetchDecoratorConfig } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'valid-api-key'
    })

    it('should call fetch with proper params', async () => {
      await fetchDecoratorConfig({
        decorator: 'test-decorator'
      })

      expect(configClientMock.getDecoratorConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getDecoratorConfig).toHaveBeenCalledWith(
        {
          s: {
            decoratorName: 'test-decorator',
            serviceName: 'TestService',
            serviceRelease: '1',
            environment: 'test'
          }
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchDecoratorConfig({
        decorator: 'test-decorator',
        lastVersionSeen: '123'
      })

      expect(configClientMock.getDecoratorConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getDecoratorConfig).toHaveBeenCalledWith(
        {
          s: {
            decoratorName: 'test-decorator',
            serviceName: 'TestService',
            serviceRelease: '1',
            environment: 'test'
          },
          versionSeen: '123'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchDecoratorConfig({ decorator: 'test-decorator' })

      expect(result).toBeNull()
    })

    it('should return null if configDataSent is false', async () => {
      configClientMock.getDecoratorConfig.mockImplementation(async () => {
        return new GetDecoratorConfigResponse({
          version: '1',
          configDataSent: false
        })
      })

      const result = await fetchDecoratorConfig({ decorator: 'test-decorator' })

      expect(result).toBeNull()
    })

    it('should return config data if configDataSent is true', async () => {
      configClientMock.getDecoratorConfig.mockImplementation(async () => {
        return new GetDecoratorConfigResponse({
          version: '1',
          configDataSent: true,
          config: {
            checkQuota: true,
            quotaTags: [],
            validateIngressTokens: false,
            traceConfig: {
              collectorUrl: 'https://url.to.trace.collector',
              collectorKey: 'trace-collector-key',
              overrides: [],
              sampleRateDefault: 0.5
            }
          } as any
        })
      })

      const result = await fetchDecoratorConfig({ decorator: 'test-decorator' })

      expect(result).toEqual({
        version: '1',
        config: {
          checkQuota: true,
          quotaTags: [],
          validateIngressTokens: false,
          traceConfig: {
            collectorUrl: 'https://url.to.trace.collector',
            collectorKey: 'trace-collector-key',
            overrides: [],
            sampleRateDefault: 0.5
          }
        }
      })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      configClientMock.getDecoratorConfig.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void fetchDecoratorConfig({ decorator: 'test-decorator' }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)
    })
  })
})
