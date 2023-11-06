import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { updateGuardConfig } from '../global/guardConfig'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { context, propagation, ROOT_CONTEXT } from '@opentelemetry/api'
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

type GetQuotaFn = GetQuotaModule['getQuota']
type GetQuotaFnParameters = Parameters<GetQuotaFn>
type GetQuotaFnReturnType = ReturnType<GetQuotaFn>

const getQuotaMock = Object.assign(
  vi.fn<GetQuotaFnParameters, GetQuotaFnReturnType>(async () => { throw Error('not implemented') }),
  {
    mockImplementationDeferred: function (this: Mock<GetQuotaFnParameters, GetQuotaFnReturnType>) {
      const deferred: {
        resolve: (value: Awaited<GetQuotaFnReturnType>) => void
        reject: (reason: unknown) => void
      } = {
        resolve: () => {},
        reject: () => {}
      }
      this.mockImplementation((): any => {
        return new Promise<Awaited<GetQuotaFnReturnType>>((resolve, reject) => {
          deferred.resolve = resolve
          deferred.reject = reject
        })
      })

      return deferred
    }
  }
)

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
    serviceRelease: '1.0.0',
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
    describe('should emit stanza.guard.allowed event', () => {
      it('when guard executes', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true,
            reportOnly: false
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
          configState: 'CONFIG_CACHED_OK',
          localReason: 'LOCAL_NOT_SUPPORTED',
          tokenReason: 'TOKEN_EVAL_DISABLED',
          quotaReason: 'QUOTA_GRANTED',
          mode: 'normal'
        })
      })

      it('with specified feature when guard executes', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true,
            reportOnly: false
          } satisfies Partial<GuardConfig['config']> as any,
          version: 'testGuardVersion'
        })

        const deferred = getQuotaMock.mockImplementationDeferred()

        const guardedDoStuff = stanzaGuard({
          guard: 'testGuard',
          feature: 'testFeature'
        }).bind(doStuff)

        const guardStuffPromise = guardedDoStuff()

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).resolves.toBeUndefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.allowed, {
          guardName: 'testGuard',
          featureName: 'testFeature',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          configState: 'CONFIG_CACHED_OK',
          localReason: 'LOCAL_NOT_SUPPORTED',
          tokenReason: 'TOKEN_EVAL_DISABLED',
          quotaReason: 'QUOTA_GRANTED',
          mode: 'normal'
        })
      })

      it('with feature specified in context when guard executes', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true,
            reportOnly: false
          } satisfies Partial<GuardConfig['config']> as any,
          version: 'testGuardVersion'
        })

        const deferred = getQuotaMock.mockImplementationDeferred()

        const guardedDoStuff = stanzaGuard({
          guard: 'testGuard'
        }).bind(doStuff)

        const contextWithBaggage = propagation.setBaggage(ROOT_CONTEXT, propagation.createBaggage({
          'stz-feat': { value: 'testBaggageFeature' }
        }))

        const guardStuffPromise = context.with(contextWithBaggage, guardedDoStuff)

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).resolves.toBeUndefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.allowed, {
          guardName: 'testGuard',
          featureName: 'testBaggageFeature',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          configState: 'CONFIG_CACHED_OK',
          localReason: 'LOCAL_NOT_SUPPORTED',
          tokenReason: 'TOKEN_EVAL_DISABLED',
          quotaReason: 'QUOTA_GRANTED',
          mode: 'normal'
        })
      })

      it('when guard executes with fail open reason when getting token returns null', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true,
            reportOnly: false
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
          configState: 'CONFIG_CACHED_OK',
          localReason: 'LOCAL_NOT_SUPPORTED',
          tokenReason: 'TOKEN_EVAL_DISABLED',
          quotaReason: 'QUOTA_ERROR',
          mode: 'normal'
        })
      })

      it('when guard executes with fail open reason when no guard config is provided', async () => {
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
          configState: 'CONFIG_UNSPECIFIED',
          localReason: 'LOCAL_NOT_SUPPORTED',
          tokenReason: 'TOKEN_EVAL_DISABLED',
          quotaReason: 'QUOTA_EVAL_DISABLED',
          mode: 'normal'
        })
      })
    })

    describe('should emit stanza.guard.blocked event', () => {
      it.skip('when guard\'s execution is blocked', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true,
            reportOnly: false
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
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId',
          configState: 'CONFIG_CACHED_OK',
          localReason: 'LOCAL_NOT_SUPPORTED',
          tokenReason: 'TOKEN_EVAL_DISABLED',
          quotaReason: 'QUOTA_BLOCKED',
          mode: 'normal'
        })
      })

      it.skip('with specified feature when guard\'s execution is blocked', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true
          } satisfies Partial<GuardConfig['config']> as any,
          version: 'testGuardVersion'
        })

        const deferred = getQuotaMock.mockImplementationDeferred()

        const guardedDoStuff = stanzaGuard({
          guard: 'testGuard',
          feature: 'testFeature'
        }).bind(doStuff)

        const guardStuffPromise = guardedDoStuff()

        deferred.resolve({ granted: false })

        await expect(guardStuffPromise).rejects.toThrow()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.blocked, {
          guardName: 'testGuard',
          featureName: 'testFeature',
          reason: 'quota',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it.skip('with feature specified in context when guard\'s execution is blocked', async () => {
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

        const contextWithBaggage = propagation.setBaggage(ROOT_CONTEXT, propagation.createBaggage({
          'stz-feat': { value: 'testBaggageFeature' }
        }))

        const guardStuffPromise = context.with(contextWithBaggage, guardedDoStuff)

        deferred.resolve({ granted: false })

        await expect(guardStuffPromise).rejects.toThrow()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.blocked, {
          guardName: 'testGuard',
          featureName: 'testBaggageFeature',
          reason: 'quota',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })
    })

    describe('should emit stanza.guard.succeeded event', () => {
      it('when function wrapped with a guard succeeds', async () => {
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

      it('with specified feature when function wrapped with a guard succeeds', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true
          } satisfies Partial<GuardConfig['config']> as any,
          version: 'testGuardVersion'
        })

        const deferred = getQuotaMock.mockImplementationDeferred()

        const guardedDoStuff = stanzaGuard({
          guard: 'testGuard',
          feature: 'testFeature'
        }).bind(doStuff)

        const guardStuffPromise = guardedDoStuff()

        mockMessageBusEmit.mockReset()

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).resolves.toBeUndefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.succeeded, {
          guardName: 'testGuard',
          featureName: 'testFeature',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('with feature specified in context when function wrapped with a guard succeeds', async () => {
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

        const contextWithBaggage = propagation.setBaggage(ROOT_CONTEXT, propagation.createBaggage({
          'stz-feat': { value: 'testBaggageFeature' }
        }))

        const guardStuffPromise = context.with(contextWithBaggage, guardedDoStuff)

        mockMessageBusEmit.mockReset()

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).resolves.toBeUndefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.succeeded, {
          guardName: 'testGuard',
          featureName: 'testBaggageFeature',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })
    })

    describe('should emit stanza.guard.failed event', () => {
      it('when function wrapped with a guard fails', async () => {
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

      it('with specified feature when function wrapped with a guard fails', async () => {
        updateGuardConfig('testGuard', {
          config: {
            checkQuota: true
          } satisfies Partial<GuardConfig['config']> as any,
          version: 'testGuardVersion'
        })

        const deferred = getQuotaMock.mockImplementationDeferred()

        const guardedDoStuff = stanzaGuard({
          guard: 'testGuard',
          feature: 'testFeature'
        }).bind(() => {
          throw new Error('kaboom')
        })

        const guardStuffPromise = guardedDoStuff()

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.failed, {
          guardName: 'testGuard',
          featureName: 'testFeature',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })

      it('with feature specified in context when function wrapped with a guard fails', async () => {
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

        const contextWithBaggage = propagation.setBaggage(ROOT_CONTEXT, propagation.createBaggage({
          'stz-feat': { value: 'testBaggageFeature' }
        }))

        const guardStuffPromise = context.with(contextWithBaggage, guardedDoStuff)

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).rejects.toThrow('kaboom')

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.failed, {
          guardName: 'testGuard',
          featureName: 'testBaggageFeature',
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })
      })
    })

    describe('should emit stanza.guard.duration event', () => {
      it('when function wrapped with a guard succeeds', async () => {
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

      it('with specified feature when function wrapped with a guard succeeds', async () => {
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
          guard: 'testGuard',
          feature: 'testFeature'
        }).bind(doStuff)

        const guardStuffPromise = guardedDoStuff()

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).resolves.toBeUndefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.duration, {
          guardName: 'testGuard',
          featureName: 'testFeature',
          duration: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })

        vi.useRealTimers()
      })

      it('with feature specified in context when function wrapped with a guard succeeds', async () => {
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

        const contextWithBaggage = propagation.setBaggage(ROOT_CONTEXT, propagation.createBaggage({
          'stz-feat': { value: 'testBaggageFeature' }
        }))

        const guardStuffPromise = context.with(contextWithBaggage, guardedDoStuff)

        await vi.advanceTimersByTimeAsync(123.456)

        deferred.resolve({ granted: true, token: 'testToken' })

        await expect(guardStuffPromise).resolves.toBeUndefined()

        expect(mockMessageBusEmit).toHaveBeenCalledWith(events.guard.duration, {
          guardName: 'testGuard',
          featureName: 'testBaggageFeature',
          duration: 123.456,
          serviceName: 'testService',
          environment: 'testEnvironment',
          clientId: 'testClientId'
        })

        vi.useRealTimers()
      })
    })
  })
})
