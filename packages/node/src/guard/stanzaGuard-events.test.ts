import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { updateGuardConfig } from '../global/guardConfig'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { context } from '@opentelemetry/api'
import { type GuardConfig } from '../hub/model'
import { stanzaGuard } from './stanzaGuard'
import { eventBus, events } from '../global/eventBus'
import type * as getQuotaModule from '../quota/getQuota'
import { updateServiceConfig } from '../global/serviceConfig'
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
  updateGuardConfig('testGuard', undefined as any)
  updateServiceConfig(undefined)

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

describe('stanzaGuard', () => {
  describe('events', () => {
    it('should emit stanza.guard.allowed event when guard executes', async () => {
      updateGuardConfig('testGuard', {
        config: {
          checkQuota: true
        } satisfies Partial<GuardConfig['config']> as any,
        version: 'testGuardVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(doStuff)

      const guardStuffPromise = guardedDoStuff()

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(guardStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.allowed, {
        guardName: 'testGuard',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId',
        reason: 'quota'
      })
    })

    it('should emit stanza.guard.allowed event when guard executes with fail open reason when getting token returns null', async () => {
      updateGuardConfig('testGuard', {
        config: {
          checkQuota: true
        } satisfies Partial<GuardConfig['config']> as any,
        version: 'testGuardVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(doStuff)

      const guardStuffPromise = guardedDoStuff()

      deferred.resolve(null)

      await expect(guardStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.allowed, {
        guardName: 'testGuard',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId',
        reason: 'fail_open'
      })
    })

    it('should emit stanza.guard.allowed event when guard executes with fail open reason when no guard config is provided', async () => {
      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(doStuff)

      const guardStuffPromise = guardedDoStuff()

      await expect(guardStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.allowed, {
        guardName: 'testGuard',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId',
        reason: 'fail_open'
      })
    })

    it('should emit stanza.guard.blocked event when guard\'s execution is blocked', async () => {
      updateGuardConfig('testGuard', {
        config: {
          checkQuota: true
        } satisfies Partial<GuardConfig['config']> as any,
        version: 'testGuardVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(doStuff)

      const guardStuffPromise = guardedDoStuff()

      deferred.resolve({ granted: false })

      await expect(guardStuffPromise).rejects.toThrow()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.blocked, {
        guardName: 'testGuard',
        featureName: '',
        reason: 'quota',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.guard.succeeded event when function wrapped with a guard succeeds', async () => {
      updateGuardConfig('testGuard', {
        config: {
          checkQuota: true
        } satisfies Partial<GuardConfig['config']> as any,
        version: 'testGuardVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(doStuff)

      const guardStuffPromise = guardedDoStuff()

      mockMessageBusEmit.mockReset()

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(guardStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.succeeded, {
        guardName: 'testGuard',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.guard.failed event when function wrapped with a guard fails', async () => {
      updateGuardConfig('testGuard', {
        config: {
          checkQuota: true
        } satisfies Partial<GuardConfig['config']> as any,
        version: 'testGuardVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(() => {
        throw new Error('kaboom')
      })

      const guardStuffPromise = guardedDoStuff()

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(guardStuffPromise).rejects.toThrow('kaboom')

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.failed, {
        guardName: 'testGuard',
        featureName: '',
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })
    })

    it('should emit stanza.guard.duration event when function wrapped with a guard succeeds', async () => {
      vi.useFakeTimers({
        now: 0
      })
      updateGuardConfig('testGuard', {
        config: {
          checkQuota: true
        } satisfies Partial<GuardConfig['config']> as any,
        version: 'testGuardVersion'
      })

      const deferred = getQuotaMock.mockImplementationDeferred()

      const guardedDoStuff = stanzaGuard({
        guard: 'testGuard'
      }).bind(doStuff)

      const guardStuffPromise = guardedDoStuff()

      await vi.advanceTimersByTimeAsync(123.456)

      deferred.resolve({ granted: true, token: 'testToken' })

      await expect(guardStuffPromise).resolves.toBeUndefined()

      expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.duration, {
        guardName: 'testGuard',
        featureName: '',
        duration: 123.456,
        serviceName: 'testService',
        environment: 'testEnvironment',
        clientId: 'testClientId'
      })

      vi.useRealTimers()
    })
  })
})
