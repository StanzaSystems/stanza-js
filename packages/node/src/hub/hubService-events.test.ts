import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
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
          decoratorName: 'testDecorator',
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
          decoratorName: 'testDecorator',
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
          decoratorName: 'testDecorator',
          latency: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })

        vi.useRealTimers()
      })
    })

    describe('getToken', () => {
      it('should emit stanza.quota.fetch_ok when fetching succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const getTokenPromise = hubService.getToken({
          decorator: 'testDecorator'
        })

        deferred.resolve({
          granted: true,
          token: 'testToken'
        })

        await expect(getTokenPromise).resolves.toEqual({
          granted: true,
          token: 'testToken'
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchOk, {
          decoratorName: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'GetToken'
        })
      })

      it('should emit stanza.quota.fetch_failed when fetching fails', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const getTokenPromise = hubService.getToken({
          decorator: 'testDecorator'
        })

        deferred.reject(new Error('kaboom'))

        await expect(getTokenPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchFailed, {
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'GetToken'
        })
      })

      it('should emit stanza.quota.fetch_latency event when fetching succeeds', async () => {
        vi.useFakeTimers({
          now: 0
        })

        const deferred = mockHubRequest.mockImplementationDeferred()

        const getTokenPromise = hubService.getToken({
          decorator: 'testDecorator'
        })

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({
          granted: true,
          token: 'testToken'
        })

        await expect(getTokenPromise).resolves.toEqual({
          granted: true,
          token: 'testToken'
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchLatency, {
          latency: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'GetToken'
        })

        vi.useRealTimers()
      })
    })

    describe('getTokenLease', () => {
      beforeEach(() => {
        vi.useFakeTimers({
          now: 0
        })
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('should emit stanza.quota.fetch_ok when fetching succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const getTokenLeasePromise = hubService.getTokenLease({
          decorator: 'testDecorator'
        })

        deferred.resolve({
          leases: [
            {
              feature: '',
              priorityBoost: 0,
              token: 'testToken',
              durationMsec: 1000
            }
          ]
        })

        await expect(getTokenLeasePromise).resolves.toEqual({
          granted: true,
          leases: [
            {
              feature: '',
              priorityBoost: 0,
              token: 'testToken',
              expiresAt: 1000
            }
          ]
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchOk, {
          decoratorName: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'GetTokenLease'
        })
      })

      it('should emit stanza.quota.fetch_failed when fetching fails', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const getTokenLeasePromise = hubService.getTokenLease({
          decorator: 'testDecorator'
        })

        deferred.reject(new Error('kaboom'))

        await expect(getTokenLeasePromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchFailed, {
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'GetTokenLease'
        })
      })

      it('should emit stanza.quota.fetch_latency event when fetching succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const getTokenLeasePromise = hubService.getTokenLease({
          decorator: 'testDecorator'
        })

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({
          leases: [
            {
              feature: '',
              priorityBoost: 0,
              token: 'testToken',
              durationMsec: 1000
            }
          ]
        })

        await expect(getTokenLeasePromise).resolves.toEqual({
          granted: true,
          leases: [
            {
              feature: '',
              priorityBoost: 0,
              token: 'testToken',
              expiresAt: 1123
            }
          ]
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchLatency, {
          latency: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'GetTokenLease'
        })
      })
    })

    describe('markTokensAsConsumed', () => {
      it('should emit stanza.quota.fetch_ok when fetching succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const markTokensAsConsumedPromise = hubService.markTokensAsConsumed({
          tokens: ['testToken']
        })

        deferred.resolve({
          granted: true,
          token: 'testToken'
        })

        await expect(markTokensAsConsumedPromise).resolves.toEqual({
          ok: true
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchOk, {
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'SetTokenLeaseConsumed'
        })
      })

      it('should emit stanza.quota.fetch_failed when fetching fails', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const markTokensAsConsumedPromise = hubService.markTokensAsConsumed({
          tokens: ['testToken']
        })

        deferred.reject(new Error('kaboom'))

        await expect(markTokensAsConsumedPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchFailed, {
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'SetTokenLeaseConsumed'
        })
      })

      it('should emit stanza.quota.fetch_latency event when fetching succeeds', async () => {
        vi.useFakeTimers({
          now: 0
        })

        const deferred = mockHubRequest.mockImplementationDeferred()

        const markTokensAsConsumedPromise = hubService.markTokensAsConsumed({
          tokens: ['testToken']
        })

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({})

        await expect(markTokensAsConsumedPromise).resolves.toEqual({
          ok: true
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.fetchLatency, {
          latency: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          endpoint: 'SetTokenLeaseConsumed'
        })

        vi.useRealTimers()
      })
    })

    describe('validateToken', () => {
      it('should emit stanza.quota.validate_ok when validating succeeds', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const validateTokenPromise = hubService.validateToken({
          decorator: 'testDecorator',
          token: 'testToken'
        })

        deferred.resolve({
          valid: true,
          tokensValid: [{
            valid: true,
            token: 'testToken'
          }]
        })

        await expect(validateTokenPromise).resolves.toEqual({
          valid: true,
          token: 'testToken'
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.validateOk, {
          decoratorName: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.quota.validate_failed when fetching fails', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const validateTokenPromise = hubService.validateToken({
          decorator: 'testDecorator',
          token: 'testToken'
        })

        deferred.reject(new Error('kaboom'))

        await expect(validateTokenPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.validateFailed, {
          decoratorName: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.quota.validate_failed when fetching return invalid token', async () => {
        const deferred = mockHubRequest.mockImplementationDeferred()

        const validateTokenPromise = hubService.validateToken({
          decorator: 'testDecorator',
          token: 'testToken'
        })

        deferred.resolve({
          valid: false,
          tokensValid: [{
            valid: false,
            token: 'testToken'
          }]
        })

        await expect(validateTokenPromise).resolves.toEqual({
          valid: false,
          token: 'testToken'
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.validateFailed, {
          decoratorName: 'testDecorator',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('should emit stanza.quota.validate_latency event when fetching succeeds', async () => {
        vi.useFakeTimers({
          now: 0
        })

        const deferred = mockHubRequest.mockImplementationDeferred()

        const validateTokenPromise = hubService.validateToken({
          decorator: 'testDecorator',
          token: 'testToken'
        })

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({
          valid: true,
          tokensValid: [{
            valid: true,
            token: 'testToken'
          }]
        })

        await expect(validateTokenPromise).resolves.toEqual({
          valid: true,
          token: 'testToken'
        })

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.quota.validateLatency, {
          decoratorName: 'testDecorator',
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