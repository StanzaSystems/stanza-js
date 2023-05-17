import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { type DecoratorConfig, type ServiceConfig } from './model'
import { eventBus, events } from '../global/eventBus'
import { createHubService } from './createHubService'

const mockMessageBusEmit = vi.spyOn(eventBus, 'emit')
const mockHubRequest = Object.assign(vi.fn(), {
  mockImplementationDeferred: function (this: Mock) {
    const deferred: {
      resolve: (value: unknown) => void
      reject: (reason: unknown) => void
    } = {
      resolve: () => {},
      reject: () => {}
    }
    this.mockImplementation((): any => {
      return new Promise<unknown>((resolve, reject) => {
        deferred.resolve = resolve
        deferred.reject = reject
      })
    })

    return deferred
  }
})
const hubService = createHubService({
  serviceName: 'testService',
  serviceRelease: '1.0.0',
  clientId: 'testClientId',
  environment: 'testEnvironment',
  hubRequest: mockHubRequest
})
beforeEach(() => {
  mockMessageBusEmit.mockReset()
  // mockHubService.reset()
})

describe('hubService', () => {
  describe('events', () => {
    describe('fetchServiceConfig', () => {
      it('should emit stanza.config.service.fetch_ok when fetching succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const fetchServiceConfigPromise = hubService.fetchServiceConfig()

        deferred.resolve({
          config: {} satisfies Partial<ServiceConfig['config']> as any,
          version: 'testVersion'
        })

        await expect(fetchServiceConfigPromise).resolves.toBeDefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.service.fetchOk, {
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.config.service.fetch_failed when fetching fails', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const fetchServiceConfigPromise = hubService.fetchServiceConfig()

        deferred.reject(new Error('kaboom'))

        await expect(fetchServiceConfigPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.service.fetchFailed, {
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.config.service.latency event when fetching succeeds', async () => {
        vi.useFakeTimers({
          now: 0
        })

        const deferred = mockHubRequest.mockImplementationDeferred()

        const fetchServiceConfigPromise = hubService.fetchServiceConfig()

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({
          config: {} satisfies Partial<DecoratorConfig['config']> as any,
          version: 'testVersion'
        })

        await expect(fetchServiceConfigPromise).resolves.toBeDefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.service.fetchLatency, {
          latency: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })

        vi.useRealTimers()
      })
    })

    describe('fetchDecoratorConfig', () => {
      it('should emit stanza.config.decorator.fetch_ok when fetching succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const fetchDecoratorPromise = hubService.fetchDecoratorConfig({
          decorator: 'testDecorator'
        })

        deferred.resolve({
          config: {} satisfies Partial<DecoratorConfig['config']> as any,
          version: 'testVersion'
        })

        await expect(fetchDecoratorPromise).resolves.toBeDefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.decorator.fetchOk, {
          decorator: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.config.decorator.fetch_failed when fetching fails', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const fetchDecoratorPromise = hubService.fetchDecoratorConfig({
          decorator: 'testDecorator'
        })

        deferred.reject(new Error('kaboom'))

        await expect(fetchDecoratorPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.decorator.fetchFailed, {
          decorator: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.config.decorator.latency event when fetching succeeds', async () => {
        vi.useFakeTimers({
          now: 0
        })

        const deferred = mockHubRequest.mockImplementationDeferred()

        const fetchDecoratorPromise = hubService.fetchDecoratorConfig({
          decorator: 'testDecorator'
        })

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({
          config: {} satisfies Partial<DecoratorConfig['config']> as any,
          version: 'testVersion'
        })

        await expect(fetchDecoratorPromise).resolves.toBeDefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.config.decorator.fetchLatency, {
          decorator: 'testDecorator',
          latency: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })

        vi.useRealTimers()
      })
    })
  })
})
