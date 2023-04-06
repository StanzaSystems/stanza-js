import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type ServiceConfigResult } from './model/serviceConfig'
import { createHubService } from './hubService'

const fetchMock = vi.fn()

beforeEach(async () => {
  fetchMock.mockImplementation(async () => ({
    json: async () => ({})
  }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})
describe('hubService', async () => {
  describe('fetchServiceConfig', function () {
    const { fetchServiceConfig } = createHubService('https://url.to.hub', 'valid-api-key')
    it('should call fetch with proper params', async () => {
      await fetchServiceConfig({
        serviceName: 'TestService',
        serviceRelease: '1',
        environment: 'test'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/service?service.name=TestService&service.release=1&service.environment=test'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          }
        }
      )
    })

    it('should call fetch with proper params - including lastVersionSeen', async () => {
      await fetchServiceConfig({
        serviceName: 'TestService',
        serviceRelease: '1',
        environment: 'test',
        lastVersionSeen: '123'
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(fetchMock).toHaveBeenCalledWith(
        new URL('https://url.to.hub/v1/config/service?service.name=TestService&service.release=1&service.environment=test&versionSeen=123'),
        {
          headers: {
            'X-Stanza-Key': 'valid-api-key'
          }
        }
      )
    })

    it('should return null if invalid data returned', async () => {
      const result = await fetchServiceConfig({
        serviceName: 'TestService',
        serviceRelease: '1',
        environment: 'test'
      })

      expect(result).toBeNull()
    })

    it('should return null if configDataSent is false', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            version: '1',
            configDataSent: false
          } satisfies ServiceConfigResult)
        }
      })

      const result = await fetchServiceConfig({
        serviceName: 'TestService',
        serviceRelease: '1',
        environment: 'test'
      })

      expect(result).toBeNull()
    })

    it('should return config data if configDataSent is true', async () => {
      fetchMock.mockImplementation(async () => {
        return {
          json: async () => ({
            version: '1',
            configDataSent: true,
            config: {
              service: { name: 'TestService', release: '1', environment: 'test', tags: [] },
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
          } satisfies ServiceConfigResult)
        }
      })

      const result = await fetchServiceConfig({
        serviceName: 'TestService',
        serviceRelease: '1',
        environment: 'test'
      })

      expect(result).toEqual({
        version: '1',
        config: {
          service: { name: 'TestService', release: '1', environment: 'test', tags: [] },
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

      void fetchServiceConfig({
        serviceName: 'TestService',
        serviceRelease: '1',
        environment: 'test'
      }).catch((e) => {
        expect(e).toEqual(new Error('Hub request timed out'))
      })

      await vi.advanceTimersByTimeAsync(1000)
      expect.assertions(1)
    })
  })
})
