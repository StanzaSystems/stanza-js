import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type GuardConfigResponse } from '../api/guardConfigResponse'
import { type ServiceConfigResponse } from '../api/serviceConfigResponse'
import { createRestHubService } from './createRestHubService'
import { createHubRequest } from './createHubRequest'
import { type StanzaTokenResponse } from '../api/stanzaTokenResponse'
import { type StanzaTokenLeaseResponse } from '../api/stanzaTokenLeaseResponse'
import { type StanzaValidateTokenResponse } from '../api/stanzaValidateTokenResponse'
import { type StanzaMarkTokensAsConsumedResponse } from '../api/stanzaMarkTokensAsConsumedResponse'
import { type StanzaGuardHealthResponse } from '../api/stanzaGuardHealthResponse'
import { Health } from '../../guard/model'

vi.mock('../../fetchImplementation', () => {
  return {
    fetch: ((...args) => fetchMock(...args)) satisfies typeof fetch
  }
})

const fetchMock = vi.fn()

beforeEach(async () => {
  fetchMock.mockImplementation(async () => ({
    json: async () => ({})
  }))
})

afterEach(() => {
  fetchMock.mockReset()
})
describe('createRestHubService', async () => {
  describe('getServiceMetadata', () => {
    const { getServiceMetadata } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should return service metadata', () => {
      expect(getServiceMetadata()).toEqual({ serviceName: 'TestService', serviceRelease: '1.0.0', environment: 'test', clientId: 'test-client-id' })
    })
  })

  describe('fetchServiceConfig', function () {
    const { fetchServiceConfig } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1.0.0',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should call fetch with proper params', async () => {
      await fetchServiceConfig()

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/service'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            service: {
              name: 'TestService',
              release: '1.0.0',
              environment: 'test'
            }
          }),
          method: 'POST'
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen, and clientId', async () => {
      await fetchServiceConfig({
        lastVersionSeen: '123',
        clientId: '456'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/service'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            versionSeen: '123',
            service: {
              name: 'TestService',
              release: '1.0.0',
              environment: 'test'
            },
            clientId: '456'
          }),
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchServiceConfig()

      expect(result).toBeNull()
    })

    it('should return null if configDataSent is false', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            version: '1',
            configDataSent: false
          } satisfies ServiceConfigResponse)
        }
      })

      const result = await fetchServiceConfig()

      expect(result).toBeNull()
    })

    it('should return config data if configDataSent is true', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            version: '1',
            configDataSent: true,
            config: {
              traceConfig: {
                collectorUrl: 'https://url.to.trace.collector',
                overrides: [],
                headerSampleConfig: [],
                paramSampleConfig: [],
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
          } satisfies ServiceConfigResponse)
        }
      })

      const result = await fetchServiceConfig()

      expect(result).toEqual({
        version: '1',
        config: {
          traceConfig: {
            collectorUrl: 'https://url.to.trace.collector',
            overrides: [],
            headerSampleConfig: [],
            paramSampleConfig: [],
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

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
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
    const { fetchGuardConfig } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should call fetch with proper params', async () => {
      await fetchGuardConfig({
        guard: 'test-guard'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/guard'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            selector: {
              guardName: 'test-guard',
              serviceName: 'TestService',
              serviceRelease: '1',
              environment: 'test'
            }
          }),
          method: 'POST'
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchGuardConfig({
        guard: 'test-guard',
        lastVersionSeen: '123'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/guard'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            versionSeen: '123',
            selector: {
              guardName: 'test-guard',
              serviceName: 'TestService',
              serviceRelease: '1',
              environment: 'test'
            }
          }),
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchGuardConfig({ guard: 'test-guard' })

      expect(result).toBeNull()
    })

    it('should return null if configDataSent is false', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            version: '1',
            configDataSent: false
          } satisfies ServiceConfigResponse)
        }
      })

      const result = await fetchGuardConfig({ guard: 'test-guard' })

      expect(result).toBeNull()
    })

    it('should return config data if configDataSent is true', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            version: '1',
            configDataSent: true,
            config: {
              checkQuota: true,
              quotaTags: [],
              validateIngressTokens: false
            }
          } satisfies GuardConfigResponse)
        }
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
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
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
    const { getToken } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should call fetch with proper params', async () => {
      await getToken({
        guard: 'test-guard',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/token'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            selector: {
              guardName: 'test-guard',
              featureName: 'test-feature',
              environment: 'test'
            },
            clientId: 'test-client-id',
            priorityBoost: 5
          }),
          method: 'POST'
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

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/token'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
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
            },
            clientId: 'test-client-id',
            priorityBoost: 5
          }),
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getToken({ guard: 'test-guard' })

      expect(result).toBeNull()
    })

    it('should return granted false', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            granted: false
          } satisfies StanzaTokenResponse)
        }
      })

      const result = await getToken({ guard: 'test-guard' })

      expect(result).toEqual({ granted: false })
    })

    it('should return token if granted is true', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            granted: true,
            token: 'test-token'
          } satisfies StanzaTokenResponse)
        }
      })

      const result = await getToken({ guard: 'test-guard' })

      expect(result).toEqual({
        granted: true,
        token: 'test-token'
      })
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
      })

      void getToken({ guard: 'test-guard' }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('getTokenLease', function () {
    const { getTokenLease } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should call fetch with proper params', async () => {
      await getTokenLease({
        guard: 'test-guard',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/lease'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            selector: {
              guardName: 'test-guard',
              featureName: 'test-feature',
              environment: 'test'
            },
            clientId: 'test-client-id',
            priorityBoost: 5
          }),
          method: 'POST'
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

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/lease'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
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
            },
            clientId: 'test-client-id',
            priorityBoost: 5
          }),
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getTokenLease({ guard: 'test-guard' })

      expect(result).toBeNull()
    })

    it('should return granted false', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            leases: []
          } satisfies StanzaTokenLeaseResponse)
        }
      })

      const result = await getTokenLease({ guard: 'test-guard' })

      expect(result).toEqual({ granted: false })
    })

    it('should return token if granted is true', async () => {
      vi.useFakeTimers({ now: 123 })
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            leases: [{
              token: 'test-token',
              feature: '',
              durationMsec: 1000,
              priorityBoost: 0
            }]
          } satisfies StanzaTokenLeaseResponse)
        }
      })

      const result = await getTokenLease({ guard: 'test-guard' })

      expect(result).toEqual({
        granted: true,
        leases: [{
          token: 'test-token',
          feature: '',
          expiresAt: 1123,
          priorityBoost: 0
        }]
      })

      vi.useRealTimers()
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
      })

      void getTokenLease({ guard: 'test-guard' }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('validateToken', function () {
    const { validateToken } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should call fetch with proper params', async () => {
      await validateToken({
        guard: 'test-guard',
        token: 'test-token'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/validatetoken'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            tokens: [{
              token: 'test-token',
              guard: 'test-guard'
            }]
          }),
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await validateToken({ guard: 'test-guard', token: 'test-token' })

      expect(result).toBeNull()
    })

    it('should return valid false', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            tokensValid: [{
              valid: false,
              token: 'test-token'
            }]
          } satisfies StanzaValidateTokenResponse)
        }
      })

      const result = await validateToken({ guard: 'test-guard', token: 'test-token' })

      expect(result).toEqual({ valid: false, token: 'test-token' })
    })

    it('should return token if valid is true', async () => {
      vi.useFakeTimers({ now: 123 })
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            tokensValid: [{
              valid: true,
              token: 'test-token'
            }]
          } satisfies StanzaValidateTokenResponse)
        }
      })

      const result = await validateToken({ guard: 'test-guard', token: 'test-token' })

      expect(result).toEqual({
        valid: true,
        token: 'test-token'
      })

      vi.useRealTimers()
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
      })

      void validateToken({ guard: 'test-guard', token: 'test-token' }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('markTokensAsConsumed', function () {
    const { markTokensAsConsumed } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
    })

    it('should call fetch with proper params', async () => {
      await markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/consumed'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            tokens: ['test-token-one', 'test-token-two']
          }),
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => []
        }
      })

      const result = await markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      })

      expect(result).toBeNull()
    })

    it('should return ok if response is correct', async () => {
      vi.useFakeTimers({ now: 123 })
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({} satisfies StanzaMarkTokensAsConsumedResponse)
        }
      })

      const result = await markTokensAsConsumed({
        tokens: ['test-token-one', 'test-token-two']
      })

      expect(result).toEqual({
        ok: true
      })

      vi.useRealTimers()
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
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
    const { getGuardHealth } = createRestHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'testApiKey',
        serviceName: 'TestService',
        serviceRelease: '1.0.0'
      })
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

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/health/guard'),
        {
          headers: {
            'X-Stanza-Key': 'testApiKey',
            'User-Agent': 'TestService/1.0.0 StanzaNodeSDK/0.0.5-beta'
          },
          body: JSON.stringify({
            selector: {
              guardName: 'testGuard',
              featureName: 'testFeature',
              environment: 'testEnvironment',
              tags: [{
                key: 'testTag',
                value: 'testTagValue'
              }]
            }
          }),
          method: 'POST'
        }
      )
    })

    it('should return Unspecified health if invalid data returned', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => 'WRONG_VALUE'
        }
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

    it('should return ok if response is correct', async () => {
      vi.useFakeTimers({ now: 123 })
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            health: 'HEALTH_OK'
          } satisfies StanzaGuardHealthResponse)
        }
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

      expect(result).toEqual(Health.Ok)

      vi.useRealTimers()
    })

    it('should timeout if fetch runs too long', async () => {
      vi.useFakeTimers()
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
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
