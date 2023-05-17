import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateDecoratorConfig } from '../global/decoratorConfig'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { context } from '@opentelemetry/api'
import { type DecoratorConfig } from '../hub/model'
import { stanzaDecorator } from './stanzaDecorator'
import { eventBus, events } from '../global/eventBus'

const mockMessageBusEmit = vi.spyOn(eventBus, 'emit')

const doStuff = vi.fn()

beforeEach(() => {
  updateDecoratorConfig('testDecorator', undefined as any)

  mockMessageBusEmit.mockReset()

  doStuff.mockReset()
  mockHubService.reset()
})

beforeAll(() => {
  const contextManager = new AsyncHooksContextManager()
  contextManager.enable()
  context.setGlobalContextManager(contextManager)
})

describe('stanzaDecorator', () => {
  describe('events', () => {
    it('should emit stanza.request.allowed event when decorator executes', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true,
          strictSynchronousQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const { resolve: resolveToken } = mockHubService.getToken.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      resolveToken({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).resolves.toBeUndefined()

      expect(eventBus.emit).toHaveBeenCalledWith(events.request.allowed, {
        decorator: 'testDecorator',
        feature: undefined
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.blocked event when decorator\'s execution is blocked', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true,
          strictSynchronousQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const tokenDeferred = mockHubService.getToken.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      tokenDeferred.resolve({ granted: false })

      await expect(decoratedStuffPromise).rejects.toThrow()

      expect(eventBus.emit).toHaveBeenCalledWith(events.request.blocked, {
        decorator: 'testDecorator',
        feature: undefined,
        reason: 'quota'
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.succeeded event when function wrapped with a decorator succeeds', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true,
          strictSynchronousQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const tokenDeferred = mockHubService.getToken.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      tokenDeferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).resolves.toBeUndefined()

      expect(eventBus.emit).toHaveBeenCalledWith(events.request.succeeded, {
        decorator: 'testDecorator',
        feature: undefined
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.failed event when function wrapped with a decorator fails', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true,
          strictSynchronousQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const tokenDeferred = mockHubService.getToken.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(() => {
        throw new Error('kaboom')
      })

      const decoratedStuffPromise = decoratedDoStuff()

      tokenDeferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).rejects.toThrow('kaboom')

      expect(eventBus.emit).toHaveBeenCalledWith(events.request.failed, {
        decorator: 'testDecorator',
        feature: undefined
        // TODO: attach service, environment and clientId to the event
        // service: 'testService',
        // environment: 'testEnvironment',
        // clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.latency event when function wrapped with a decorator succeeds', async () => {
      vi.useFakeTimers({
        now: 0
      })
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true,
          strictSynchronousQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const tokenDeferred = mockHubService.getToken.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      await vi.advanceTimersByTimeAsync(123.456)

      tokenDeferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).resolves.toBeUndefined()

      expect(eventBus.emit).toHaveBeenCalledWith(events.request.latency, {
        decorator: 'testDecorator',
        feature: undefined,
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
