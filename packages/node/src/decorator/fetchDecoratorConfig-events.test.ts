import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { fetchDecoratorConfig } from './fetchDecoratorConfig'
import { type DecoratorConfig } from '../hub/model'
import { events, messageBus } from '../global/messageBus'

const mockMessageBusEmit = vi.spyOn(messageBus, 'emit')
beforeEach(() => {
  mockHubService.reset()
})

describe('fetchDecoratorConfig', () => {
  describe('events', () => {
    it('should emit stanza.config.decorator.fetch_ok when fetching succeeds', async () => {
      const deferred = mockHubService.fetchDecoratorConfig.mockImplementationDeferred()

      const fetchDecoratorPromise = fetchDecoratorConfig({
        decorator: 'testDecorator'
      })

      deferred.resolve({
        config: {} satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testVersion'
      })

      await expect(fetchDecoratorPromise).resolves.toEqual({
        config: {},
        version: 'testVersion'
      })

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.decorator.fetchOk, {
        decorator: 'testDecorator'
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.config.decorator.fetch_failed when fetching fails', async () => {
      const deferred = mockHubService.fetchDecoratorConfig.mockImplementationDeferred()

      const fetchDecoratorPromise = fetchDecoratorConfig({
        decorator: 'testDecorator'
      })

      deferred.reject(new Error('kaboom'))

      await expect(fetchDecoratorPromise).rejects.toThrow('kaboom')

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.decorator.fetchFailed, {
        decorator: 'testDecorator'
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.config.decorator.latency event when fetching succeeds', async () => {
      vi.useFakeTimers({
        now: 0
      })

      const deferred = mockHubService.fetchDecoratorConfig.mockImplementationDeferred()

      const fetchDecoratorPromise = fetchDecoratorConfig({
        decorator: 'testDecorator'
      })

      await vi.advanceTimersByTimeAsync(123.456)

      deferred.resolve({
        config: {} satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testVersion'
      })

      await expect(fetchDecoratorPromise).resolves.toEqual({
        config: {},
        version: 'testVersion'
      })

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.decorator.fetchLatency, {
        decorator: 'testDecorator',
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
