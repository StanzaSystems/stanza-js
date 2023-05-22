import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type DecoratorConfigResponse } from './api/decoratorConfigResponse'
import { type ServiceConfigResponse } from './api/serviceConfigResponse'
import { createHubService } from './createHubService'
import { createHubRequest } from './createHubRequest'

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
        new URL('https://url.to.hub/v1/config/decorator?decorator=test-decorator&service.name=TestService&service.release=1&service.environment=test'),
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
        new URL('https://url.to.hub/v1/config/decorator?decorator=test-decorator&service.name=TestService&service.release=1&service.environment=test&versionSeen=123'),
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
              decorator: 'test-decorator',
              checkQuota: true,
              environment: 'test',
              quotaTags: [],
              strictSynchronousQuota: true,
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
          decorator: 'test-decorator',
          checkQuota: true,
          environment: 'test',
          quotaTags: [],
          strictSynchronousQuota: true,
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
    })
  })
})
