import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { updateDecoratorConfig } from '../global/decoratorConfig'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { context } from '@opentelemetry/api'
import { type DecoratorConfig } from '../hub/model'
import { stanzaDecorator } from './stanzaDecorator'
import { eventBus, events } from '../global/eventBus'
import type * as getQuotaModule from '../quota/getQuota'
type GetQuotaModule = typeof getQuotaModule

const mockMessageBusEmit = vi.spyOn(eventBus, 'emit')

const doStuff = vi.fn()

vi.mock('../quota/getQuota', () => {
  return {
    getQuota: async (...args) => getQuotaMock(...args)
  } satisfies GetQuotaModule
})

const getQuotaMock = Object.assign(
  vi.fn<Parameters<GetQuotaModule['getQuota']>, ReturnType<GetQuotaModule['getQuota']>>(async () => { throw Error('not implemented') }),
  {
    mockImplementationDeferred: function (this: Mock<Parameters<GetQuotaModule['getQuota']>, ReturnType<GetQuotaModule['getQuota']>>) {
      const deferred: {
        resolve: (value: Awaited<ReturnType<GetQuotaModule['getQuota']>>) => void
        reject: (reason: unknown) => void
      } = {
        resolve: () => {},
        reject: () => {}
      }
      this.mockImplementation((): any => {
        return new Promise<Awaited<ReturnType<GetQuotaModule['getQuota']>>>((resolve, reject) => {
          deferred.resolve = resolve
          deferred.reject = reject
        })
      })

      return deferred
    }
  })

beforeEach(() => {
  updateDecoratorConfig('testDecorator', undefined as any)

  mockMessageBusEmit.mockReset()

  doStuff.mockReset()
  getQuotaMock.mockReset()
  getQuotaMock.mockImplementation(async () => { throw Error('not implemented') })
  mockHubService.reset()
  mockHubService.getServiceMetadata.mockImplementation(() => ({
    serviceName: 'testService',
    environment: 'testEnvironment',
    clientId: 'testClientId'
  }))
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
          checkQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.request.allowed, {
        decoratorName: 'testDecorator',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.blocked event when decorator\'s execution is blocked', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      deferred.resolve({ granted: false })

      await expect(decoratedStuffPromise).rejects.toThrow()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.request.blocked, {
        decoratorName: 'testDecorator',
        featureName: '',
        reason: 'quota',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.succeeded event when function wrapped with a decorator succeeds', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      mockMessageBusEmit.mockReset()

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.request.succeeded, {
        decoratorName: 'testDecorator',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.failed event when function wrapped with a decorator fails', async () => {
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(() => {
        throw new Error('kaboom')
      })

      const decoratedStuffPromise = decoratedDoStuff()

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).rejects.toThrow('kaboom')

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.request.failed, {
        decoratorName: 'testDecorator',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.request.latency event when function wrapped with a decorator succeeds', async () => {
      vi.useFakeTimers({
        now: 0
      })
      updateDecoratorConfig('testDecorator', {
        config: {
          checkQuota: true
        } satisfies Partial<DecoratorConfig['config']> as any,
        version: 'testDecoratorVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const decoratedDoStuff = stanzaDecorator({
        decorator: 'testDecorator'
      }).bind(doStuff)

      const decoratedStuffPromise = decoratedDoStuff()

      await vi.advanceTimersByTimeAsync(123.456)

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(decoratedStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.request.latency, {
        decoratorName: 'testDecorator',
        featureName: '',
        latency: 123.456,
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })

      vi.useRealTimers()
    })
  })
})
