import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { fetchServiceConfig } from './fetchServiceConfig'
import { type ServiceConfig } from '../hub/model'
import { events, messageBus } from '../global/messageBus'

const mockMessageBusEmit = vi.spyOn(messageBus, 'emit')
beforeEach(() => {
  mockHubService.reset()
})

describe('fetchServiceConfig', () => {
  describe('events', () => {
    it('should emit stanza.config.service.fetch_ok when fetching succeeds', async () => {
      const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()

      const fetchServicePromise = fetchServiceConfig()

      deferred.resolve({
        config: {} satisfies Partial<ServiceConfig['config']> as any,
        version: 'testVersion'
      })

      await expect(fetchServicePromise).resolves.toEqual({
        config: {},
        version: 'testVersion'
      })

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.service.fetchOk, {
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.config.service.fetch_failed when fetching fails', async () => {
      const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()

      const fetchServicePromise = fetchServiceConfig()

      deferred.reject(new Error('kaboom'))

      await expect(fetchServicePromise).rejects.toThrow('kaboom')

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.service.fetchFailed, {
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.config.service.latency event when fetching succeeds', async () => {
      vi.useFakeTimers({
        now: 0
      })

      const deferred = mockHubService.fetchServiceConfig.mockImplementationDeferred()

      const fetchServicePromise = fetchServiceConfig()

      await vi.advanceTimersByTimeAsync(123.456)

      deferred.resolve({
        config: {} satisfies Partial<ServiceConfig['config']> as any,
        version: 'testVersion'
      })

      await expect(fetchServicePromise).resolves.toEqual({
        config: {},
        version: 'testVersion'
      })

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.service.fetchLatency, {
        latency: 123.456
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })

      vi.useRealTimers()
    })
  })
})
