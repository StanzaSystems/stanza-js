import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type DecoratorConfigResponse } from './api/decoratorConfigResponse'
import { type ServiceConfigResponse } from './api/serviceConfigResponse'
import { createHubService } from './createHubService'
import { createHubRequest } from './createHubRequest'
import { type StanzaTokenResponse } from './api/stanzaTokenResponse'
import { type StanzaTokenLeaseResponse } from './api/stanzaTokenLeaseResponse'

vi.mock('../fetchImplementation', () => {
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
describe('hubService', async () => {
  describe('fetchServiceConfig', function () {
    const { fetchServiceConfig } = createHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'valid-api-key'
      })
    })

    it('should call fetch with proper params', async () => {
      await fetchServiceConfig()

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/service?service.name=TestService&service.release=1&service.environment=test'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          },
          method: 'GET'
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchServiceConfig({
        lastVersionSeen: '123'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/service?service.name=TestService&service.release=1&service.environment=test&versionSeen=123'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          },
          method: 'GET'
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
          } satisfies ServiceConfigResponse)
        }
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

  describe('fetchDecoratorConfig', function () {
    const { fetchDecoratorConfig } = createHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'valid-api-key'
      })
    })

    it('should call fetch with proper params', async () => {
      await fetchDecoratorConfig({
        decorator: 'test-decorator'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/decorator?s.decoratorName=test-decorator&s.serviceName=TestService&s.serviceRelease=1&s.environment=test'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          },
          method: 'GET'
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchDecoratorConfig({
        decorator: 'test-decorator',
        lastVersionSeen: '123'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/decorator?s.decoratorName=test-decorator&s.serviceName=TestService&s.serviceRelease=1&s.environment=test&versionSeen=123'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          },
          method: 'GET'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchDecoratorConfig({ decorator: 'test-decorator' })

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

      const result = await fetchDecoratorConfig({ decorator: 'test-decorator' })

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
              validateIngressTokens: false,
              traceConfig: {
                collectorUrl: 'https://url.to.trace.collector',
                collectorKey: 'trace-collector-key',
                overrides: [],
                sampleRateDefault: 0.5
              }
            }
          } satisfies DecoratorConfigResponse)
        }
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
      fetchMock.mockImplementation(async () => {
        return new Promise(() => {})
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
    const { getToken } = createHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'valid-api-key'
      })
    })

    it('should call fetch with proper params', async () => {
      await getToken({
        decorator: 'test-decorator',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/token?s.decoratorName=test-decorator&s.featureName=test-feature&s.environment=test&clientId=test-client-id&priorityBoost=5'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          },
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getToken({ decorator: 'test-decorator' })

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

      const result = await getToken({ decorator: 'test-decorator' })

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

      const result = await getToken({ decorator: 'test-decorator' })

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

      void getToken({ decorator: 'test-decorator' }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })

  describe('getTokenLease', function () {
    const { getTokenLease } = createHubService({
      serviceName: 'TestService',
      serviceRelease: '1',
      environment: 'test',
      clientId: 'test-client-id',
      hubRequest: createHubRequest({
        hubUrl: 'https://url.to.hub',
        apiKey: 'valid-api-key'
      })
    })

    it('should call fetch with proper params', async () => {
      await getTokenLease({
        decorator: 'test-decorator',
        feature: 'test-feature',
        priorityBoost: 5
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/quota/lease?s.decoratorName=test-decorator&s.featureName=test-feature&s.environment=test&clientId=test-client-id&priorityBoost=5'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          },
          method: 'POST'
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await getTokenLease({ decorator: 'test-decorator' })

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

      const result = await getTokenLease({ decorator: 'test-decorator' })

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

      const result = await getTokenLease({ decorator: 'test-decorator' })

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

      void getTokenLease({ decorator: 'test-decorator' }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)

      vi.useRealTimers()
    })
  })
})
