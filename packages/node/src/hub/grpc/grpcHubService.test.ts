import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGrpcHubService } from './createGrpcHubService'
import type * as connectNodeModule from '@bufbuild/connect'
import { type ConfigService } from '../../../gen/stanza/hub/v1/config_connect'
import { type QuotaService } from '../../../gen/stanza/hub/v1/quota_connect'
import {
  GetGuardConfigResponse,
  GetServiceConfigResponse
} from '../../../gen/stanza/hub/v1/config_pb'
import {
  GetTokenLeaseResponse,
  GetTokenResponse,
  SetTokenLeaseConsumedResponse,
  ValidateTokenResponse
} from '../../../gen/stanza/hub/v1/quota_pb'
import { type HealthService } from '../../../gen/stanza/hub/v1/health_connect'
import { type AuthService } from '../../../gen/stanza/hub/v1/auth_connect'
import { QueryGuardHealthResponse } from '../../../gen/stanza/hub/v1/health_pb'
import { Health as APIHealth } from '../../../gen/stanza/hub/v1/common_pb'
import { Health } from '../../guard/model'

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
  getGuardConfig: vi.fn(),
  getBrowserContext: vi.fn()
} satisfies connectNodeModule.PromiseClient<typeof ConfigService>

const quotaClientMock = {
  getToken: vi.fn(),
  getTokenLease: vi.fn(),
  setTokenLeaseConsumed: vi.fn(),
  validateToken: vi.fn()
} satisfies connectNodeModule.PromiseClient<typeof QuotaService>

const authClientMock = {
  getBearerToken: vi.fn()
} satisfies connectNodeModule.PromiseClient<typeof AuthService>

const healthClientMock = {
  queryGuardHealth: vi.fn()
} satisfies connectNodeModule.PromiseClient<typeof HealthService>

beforeEach(async () => {
  createPromiseClientMock.mockReset()

  configClientMock.getServiceConfig.mockReset()
  configClientMock.getGuardConfig.mockReset()
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
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should return service metadata', () => {
      expect(getServiceMetadata()).toEqual({ serviceName: 'TestService', serviceRelease: '1.0.0', environment: 'test', clientId: 'test-client-id' })
    })
  })

  describe('fetchServiceConfig', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { fetchServiceConfig } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1.0.0',
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
          service: { name: 'TestService', environment: 'test', release: '1.0.0' }
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen and clientId', async () => {
      await fetchServiceConfig({
        lastVersionSeen: '123',
        clientId: '456'
      })

      expect(configClientMock.getServiceConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getServiceConfig).toHaveBeenCalledWith(
        {
          service: { name: 'TestService', environment: 'test', release: '1.0.0' },
          versionSeen: '123',
          clientId: '456'
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

  describe('fetchGuardConfig', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    const { fetchGuardConfig } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await fetchGuardConfig({
        guard: 'test-guard'
      })

      expect(configClientMock.getGuardConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getGuardConfig).toHaveBeenCalledWith(
        {
          selector: {
            guardName: 'test-guard',
            serviceName: 'TestService',
            serviceRelease: '1.0.0',
            environment: 'test'
          }
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchGuardConfig({
        guard: 'test-guard',
        lastVersionSeen: '123'
      })

      expect(configClientMock.getGuardConfig).toHaveBeenCalledOnce()
      expect(configClientMock.getGuardConfig).toHaveBeenCalledWith(
        {
          selector: {
            guardName: 'test-guard',
            serviceName: 'TestService',
            serviceRelease: '1.0.0',
            environment: 'test'
          },
          versionSeen: '123'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchGuardConfig({ guard: 'test-guard' })

      expect(result).toBeNull()
    })

    it('should return null if configDataSent is false', async () => {
      configClientMock.getGuardConfig.mockImplementation(async () => {
        return new GetGuardConfigResponse({
          version: '1',
          configDataSent: false
        })
      })

      const result = await fetchGuardConfig({ guard: 'test-guard' })

      expect(result).toBeNull()
    })

    it('should return config data if configDataSent is true', async () => {
      configClientMock.getGuardConfig.mockImplementation(async () => {
        return new GetGuardConfigResponse({
          version: '1',
          configDataSent: true,
          config: {
            checkQuota: true,
            quotaTags: [],
            validateIngressTokens: false
          }
        })
      })

      const result = await fetchGuardConfig({ guard: 'test-guard' })

      expect(result).toEqual({
        version: '1',
        config: {
          checkQuota: true,
          quotaTags: [],
          validateIngressTokens: false
        }
      })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      configClientMock.getGuardConfig.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void fetchGuardConfig({ guard: 'test-guard' }).catch((e) => {
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
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await getToken({
        guard: 'test-guard',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(quotaClientMock.getToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.getToken).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          priorityBoost: 5,
          selector: {
            guardName: 'test-guard',
            featureName: 'test-feature',
            environment: 'test'
          }
        }
      )
    })

    it('should call fetch with proper params - including tags', async () => {
      await getToken({
        guard: 'test-guard',
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
            guardName: 'test-guard',
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
        guard: 'test-guard'
      })

      expect(quotaClientMock.getToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.getToken).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          selector: {
            guardName: 'test-guard',
            environment: 'test'
          }
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getToken({
        guard: 'test-guard'
      })

      expect(result).toBeNull()
    })

    it('should return granted false', async () => {
      quotaClientMock.getToken.mockImplementation(async () => {
        return new GetTokenResponse({ granted: false })
      })

      const result = await getToken({
        guard: 'test-guard'
      })

      expect(result).toEqual({ granted: false })
    })

    it('should return granted true', async () => {
      quotaClientMock.getToken.mockImplementation(async () => {
        return new GetTokenResponse({ granted: true, token: 'test-token' })
      })

      const result = await getToken({
        guard: 'test-guard'
      })

      expect(result).toEqual({ granted: true, token: 'test-token' })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      quotaClientMock.getToken.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void getToken({
        guard: 'test-guard'
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
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await getTokenLease({
        guard: 'test-guard',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(quotaClientMock.getTokenLease).toHaveBeenCalledOnce()
      expect(quotaClientMock.getTokenLease).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          priorityBoost: 5,
          selector: {
            guardName: 'test-guard',
            featureName: 'test-feature',
            environment: 'test'
          }
        }
      )
    })

    it('should call fetch with proper params - including tags', async () => {
      await getTokenLease({
        guard: 'test-guard',
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
            guardName: 'test-guard',
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
        guard: 'test-guard'
      })

      expect(quotaClientMock.getTokenLease).toHaveBeenCalledOnce()
      expect(quotaClientMock.getTokenLease).toHaveBeenCalledWith(
        {
          clientId: 'test-client-id',
          selector: {
            guardName: 'test-guard',
            environment: 'test'
          }
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getTokenLease({
        guard: 'test-guard'
      })

      expect(result).toBeNull()
    })

    it('should return granted false', async () => {
      quotaClientMock.getTokenLease.mockImplementation(async () => {
        return new GetTokenLeaseResponse({ leases: [] })
      })

      const result = await getTokenLease({
        guard: 'test-guard'
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
        guard: 'test-guard'
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
        guard: 'test-guard'
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
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await validateToken({
        token: 'test-token',
        guard: 'test-guard'
      })

      expect(quotaClientMock.validateToken).toHaveBeenCalledOnce()
      expect(quotaClientMock.validateToken).toHaveBeenCalledWith(
        {
          tokens: [{
            token: 'test-token',
            guard: {
              name: 'test-guard',
              environment: 'test'
            }
          }]
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await validateToken({
        token: 'test-token',
        guard: 'test-guard'
      })

      expect(result).toBeNull()
    })

    it('should return valid false', async () => {
      quotaClientMock.validateToken.mockImplementation(async () => {
        return new ValidateTokenResponse({ tokensValid: [{ token: 'test-token', valid: false }] })
      })

      const result = await validateToken({
        token: 'test-token',
        guard: 'test-guard'
      })

      expect(result).toEqual({ valid: false, token: 'test-token' })
    })

    it('should return valid true', async () => {
      quotaClientMock.validateToken.mockImplementation(async () => {
        return new ValidateTokenResponse({ tokensValid: [{ token: 'test-token', valid: true }] })
      })

      const result = await validateToken({
        token: 'test-token',
        guard: 'test-guard'
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
        guard: 'test-guard'
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
      serviceRelease: '1.0.0',
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

  describe('getGuardHealth', function () {
    createPromiseClientMock.mockImplementationOnce(() => configClientMock)
    createPromiseClientMock.mockImplementationOnce(() => quotaClientMock)
    createPromiseClientMock.mockImplementationOnce(() => authClientMock)
    createPromiseClientMock.mockImplementationOnce(() => healthClientMock)
    const { getGuardHealth } = createGrpcHubService({
      serviceName: 'TestService',
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubUrl: 'https://url.to.hub',
      apiKey: 'testApiKey'
    })

    it('should call fetch with proper params', async () => {
      await getGuardHealth({
        guard: 'testGuard',
        feature: 'testFeature',
        environment: 'testEnvironment',
        tags: [{
          key: 'testTag',
          value: 'testTagValue'
        }]
      })

      expect(healthClientMock.queryGuardHealth).toHaveBeenCalledOnce()
      expect(healthClientMock.queryGuardHealth).toHaveBeenCalledWith(
        {
          selector: {
            guardName: 'testGuard',
            featureName: 'testFeature',
            environment: 'testEnvironment',
            tags: [{
              key: 'testTag',
              value: 'testTagValue'
            }]
          }
        }
      )
    })

    it('should return Unspecified health if invalid data returned', async () => {
      healthClientMock.queryGuardHealth.mockImplementation(async () => {
        return 'WRONG_VALUE' as any
      })

      const result = await getGuardHealth({
        guard: 'testGuard',
        feature: 'testFeature',
        environment: 'testEnvironment',
        tags: [{
          key: 'testTag',
          value: 'testTagValue'
        }]
      })

      expect(result).toBe(Health.Unspecified)
    })

    it('should return valid response', async () => {
      healthClientMock.queryGuardHealth.mockImplementation(async () => {
        return new QueryGuardHealthResponse({
          health: APIHealth.OK
        })
      })

      const result = await getGuardHealth({
        guard: 'testGuard',
        feature: 'testFeature',
        environment: 'testEnvironment',
        tags: [{
          key: 'testTag',
          value: 'testTagValue'
        }]
      })

      expect(result).toBe(Health.Ok)
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      healthClientMock.queryGuardHealth.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })

      void getGuardHealth({
        guard: 'testGuard',
        feature: 'testFeature',
        environment: 'testEnvironment',
        tags: [{
          key: 'testTag',
          value: 'testTagValue'
        }]
      }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })
})
