import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGrpcHubService } from './createGrpcHubService'
import type * as connectNodeModule from '@bufbuild/connect'
import { type ConfigService } from '../../../gen/stanza/hub/v1/config_connect'
import { type QuotaService } from '../../../gen/stanza/hub/v1/quota_connect'
import { GetDecoratorConfigResponse, GetServiceConfigResponse } from '../../../gen/stanza/hub/v1/config_pb'
import {
  GetTokenLeaseResponse,
  GetTokenResponse,
  SetTokenLeaseConsumedResponse,
  ValidateTokenResponse
} from '../../../gen/stanza/hub/v1/quota_pb'

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
  describe('getServiceMetadata', () => {
    const { getServiceMetadata } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should return service metadata', () => {
      expect(getServiceMetadata()).toEqual({ serviceName: 'TestService', environment: 'test', clientId: 'test-client-id' })
    })
  })

  describe('fetchServiceConfig', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { fetchServiceConfig } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
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
              overrides: [],
              sampleRateDefault: 0.5
            },
            metricConfig: {
              collectorUrl: 'https://url.to.metric.collector'
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
            overrides: [],
            sampleRateDefault: 0.5,
            headerSampleConfig: [],
            paramSampleConfig: []
          },
          metricConfig: {
            collectorUrl: 'https://url.to.metric.collector'
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
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
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
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await fetchDecoratorConfig({
        decorator: 'test-decorator'
      })

      expect(configClientMock.getDecoratorConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getDecoratorConfig).toHaveBeenCalledWith(
        {
          selector: {
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
          selector: {
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

      vi.useRealTimers()
    })
  })

  describe('getToken', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { getToken } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await getToken({
        decorator: 'test-decorator',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(quotaClientMock.getToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.getToken).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          priorityBoost: 5,
          selector: {
            decoratorName: 'test-decorator',
            featureName: 'test-feature',
            environment: 'test'
          }
        }
      )
    })

    it('should call fetch with proper params - including tags', async () => {
      await getToken({
        decorator: 'test-decorator',
        feature: 'test-feature',
        priorityBoost: 5,
        tags: [
          {
            key: 'test-tag',
            value: 'test tag value'
          },
          {
            key: 'another-test-tag',
            value: 'another test tag value'
          }
        ]
      })

      expect(quotaClientMock.getToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.getToken).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          priorityBoost: 5,
          selector: {
            decoratorName: 'test-decorator',
            featureName: 'test-feature',
            environment: 'test',
            tags: [
              {
                key: 'test-tag',
                value: 'test tag value'
              },
              {
                key: 'another-test-tag',
                value: 'another test tag value'
              }
            ]
          }
        }
      )
    })

    it('should call fetch with proper params - without feature and boost', async () => {
      await getToken({
        decorator: 'test-decorator'
      })

      expect(quotaClientMock.getToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.getToken).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          selector: {
            decoratorName: 'test-decorator',
            environment: 'test'
          }
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getToken({
        decorator: 'test-decorator'
      })

      expect(result).toBeNull()
    })

    it('should return granted false', async () => {
      quotaClientMock.getToken.mockImplementation(async () => {
        return new GetTokenResponse({ granted: false })
      })

      const result = await getToken({
        decorator: 'test-decorator'
      })

      expect(result).toEqual({ granted: false })
    })

    it('should return granted true', async () => {
      quotaClientMock.getToken.mockImplementation(async () => {
        return new GetTokenResponse({ granted: true, token: 'test-token' })
      })

      const result = await getToken({
        decorator: 'test-decorator'
      })

      expect(result).toEqual({ granted: true, token: 'test-token' })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      quotaClientMock.getToken.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void getToken({
        decorator: 'test-decorator'
      }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('getTokenLease', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { getTokenLease } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await getTokenLease({
        decorator: 'test-decorator',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(quotaClientMock.getTokenLease).toHaveBeenCalledOnce()
      expect(quotaClientMock.getTokenLease).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          priorityBoost: 5,
          selector: {
            decoratorName: 'test-decorator',
            featureName: 'test-feature',
            environment: 'test'
          }
        }
      )
    })

    it('should call fetch with proper params - including tags', async () => {
      await getTokenLease({
        decorator: 'test-decorator',
        feature: 'test-feature',
        priorityBoost: 5,
        tags: [
          {
            key: 'test-tag',
            value: 'test tag value'
          },
          {
            key: 'another-test-tag',
            value: 'another test tag value'
          }
        ]
      })

      expect(quotaClientMock.getTokenLease).toHaveBeenCalledOnce()
      expect(quotaClientMock.getTokenLease).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          priorityBoost: 5,
          selector: {
            decoratorName: 'test-decorator',
            featureName: 'test-feature',
            environment: 'test',
            tags: [
              {
                key: 'test-tag',
                value: 'test tag value'
              },
              {
                key: 'another-test-tag',
                value: 'another test tag value'
              }
            ]
          }
        }
      )
    })

    it('should call fetch with proper params - without feature and boost', async () => {
      await getTokenLease({
        decorator: 'test-decorator'
      })

      expect(quotaClientMock.getTokenLease).toHaveBeenCalledOnce()
      expect(quotaClientMock.getTokenLease).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          selector: {
            decoratorName: 'test-decorator',
            environment: 'test'
          }
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getTokenLease({
        decorator: 'test-decorator'
      })

      expect(result).toBeNull()
    })

    it('should return granted false', async () => {
      quotaClientMock.getTokenLease.mockImplementation(async () => {
        return new GetTokenLeaseResponse({ leases: [] })
      })

      const result = await getTokenLease({
        decorator: 'test-decorator'
      })

      expect(result).toEqual({ granted: false })
    })

    it('should return granted true', async () => {
      vi.useFakeTimers({ now: 123 })

      quotaClientMock.getTokenLease.mockImplementation(async () => {
        return new GetTokenLeaseResponse({
          leases: [{
            token: 'test-token',
            feature: '',
            priorityBoost: 0,
            durationMsec: 1000
          }]
        })
      })

      const result = await getTokenLease({
        decorator: 'test-decorator'
      })

      expect(result).toEqual({
        granted: true,
        leases: [{
          token: 'test-token',
          feature: '',
          priorityBoost: 0,
          expiresAt: 1123
        }]
      })

      vi.useRealTimers()
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()

      quotaClientMock.getTokenLease.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void getTokenLease({
        decorator: 'test-decorator'
      }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('validateToken', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { validateToken } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await validateToken({
        token: 'test-token',
        decorator: 'test-decorator'
      })

      expect(quotaClientMock.validateToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.validateToken).toHaveBeenCalledWith(
        {
          tokens: [{
            token: 'test-token',
            decorator: {
              name: 'test-decorator',
              environment: 'test'
            }
          }]
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await validateToken({
        token: 'test-token',
        decorator: 'test-decorator'
      })

      expect(result).toBeNull()
    })

    it('should return valid false', async () => {
      quotaClientMock.validateToken.mockImplementation(async () => {
        return new ValidateTokenResponse({ tokensValid: [{ token: 'test-token', valid: false }] })
      })

      const result = await validateToken({
        token: 'test-token',
        decorator: 'test-decorator'
      })

      expect(result).toEqual({ valid: false, token: 'test-token' })
    })

    it('should return valid true', async () => {
      quotaClientMock.validateToken.mockImplementation(async () => {
        return new ValidateTokenResponse({ tokensValid: [{ token: 'test-token', valid: true }] })
      })

      const result = await validateToken({
        token: 'test-token',
        decorator: 'test-decorator'
      })

      expect(result).toEqual({ valid: true, token: 'test-token' })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      quotaClientMock.validateToken.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void validateToken({
        token: 'test-token',
        decorator: 'test-decorator'
      }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('markTokensAsConsumed', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { markTokensAsConsumed } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      })

      expect(quotaClientMock.setTokenLeaseConsumed).toHaveBeenCalledOnce()
      expect(quotaClientMock.setTokenLeaseConsumed).toHaveBeenCalledWith(
        {
          tokens: ['test-token-one', 'test-token-two']
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      quotaClientMock.setTokenLeaseConsumed.mockImplementation(async () => {
        return [] as any
      })

      const result = await markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      })

      expect(result).toBeNull()
    })

    it('should return ok response', async () => {
      quotaClientMock.setTokenLeaseConsumed.mockImplementation(async () => {
        return new SetTokenLeaseConsumedResponse()
      })

      const result = await markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      })

      expect(result).toEqual({ ok: true })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      quotaClientMock.setTokenLeaseConsumed.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })
})
