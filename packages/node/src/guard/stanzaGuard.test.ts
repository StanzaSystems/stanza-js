import { context } from '@opentelemetry/api'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { mockHubService } from '../__tests__/mocks/mockHubService'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'
import { updateGuardConfig } from '../global/guardConfig'
import { type GuardConfig, type ServiceConfig } from '../hub/model'
import { stanzaGuard } from './stanzaGuard'
import { StanzaGuardError } from './stanzaGuardError'
import type * as getQuotaModule from '../quota/getQuota'
import { guardStore } from '../global/guardStore'
import { resetServiceConfig, updateServiceConfig } from '../global/serviceConfig'

type GetQuotaModule = typeof getQuotaModule

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
  resetServiceConfig()
  updateGuardConfig('testGuard', undefined as any)

  doStuff.mockReset()
  getQuotaMock.mockReset()
  getQuotaMock.mockImplementation(async () => { throw Error('not implemented') })
  mockHubService.reset()
  guardStore.clear()
})

beforeAll(() => {
  const contextManager = new AsyncHooksContextManager()
  contextManager.enable()
  context.setGlobalContextManager(contextManager)
})

const mockServiceConfig: ServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: []
    },
    metricConfig: {
      collectorUrl: 'https://test.collector'
    },
    sentinelConfig: {
      circuitbreakerRulesJson: 'circuitbreakerRulesJson',
      flowRulesJson: 'flowRulesJson',
      isolationRulesJson: 'isolationRulesJson',
      systemRulesJson: 'systemRulesJson'
    }
  }
}

describe('stanzaGuard', function () {
  it('should block execution until service config is available', async () => {
    const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
      doStuff()
    })

    const guardedDoStuffPromise = guardedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    updateServiceConfig(mockServiceConfig)

    await expect(guardedDoStuffPromise).resolves.toBeUndefined()

    expect(getQuotaMock).not.toHaveBeenCalled()
    expect(doStuff).toHaveBeenCalledOnce()
  })

  it('should pass-through the execution when service config is initialized with undefined', async () => {
    const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
      doStuff()
    })

    const guardedDoStuffPromise = guardedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    updateServiceConfig(undefined)

    await expect(guardedDoStuffPromise).resolves.toBeUndefined()

    expect(getQuotaMock).not.toHaveBeenCalled()
    expect(doStuff).toHaveBeenCalledOnce()
  })

  describe('with service config initialized', () => {
    beforeEach(() => {
      updateServiceConfig(mockServiceConfig)
    })

    it('should pass-through execution initially and return same value as wrapped function', async function () {
      doStuff.mockReturnValueOnce('test-value')
      const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
        return doStuff()
      })

      const guardedDoStuffPromise = guardedDoStuff()

      await expect(guardedDoStuffPromise).resolves.toBe('test-value')

      expect(doStuff).toHaveBeenCalledOnce()
    })

    it('should continue pass-through execution if getting config fails', async function () {
      vi.useFakeTimers()

      let rejectConfig: (reason: Error) => void = () => {
        expect.fail('should not be called')
      }
      mockHubService.fetchGuardConfig.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectConfig = reject
        })
      })
      const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      rejectConfig(new Error('Getting guard config failed'))

      await vi.advanceTimersByTimeAsync(0)

      const guardedDoStuffPromise = guardedDoStuff()

      await expect(guardedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should fetch guard config upon initialization', async function () {
      mockHubService.fetchServiceConfig.mockImplementation(async () => Promise.resolve({
        version: 'test',
        config: {} as any
      }))

      stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledOnce()
    })

    it('should fetch guard config only once upon initialization of the same guard multiple times', async function () {
      mockHubService.fetchServiceConfig.mockImplementation(async () => Promise.resolve({
        version: 'test',
        config: {} as any
      }))

      stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledOnce()
      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledWith({ guard: 'testGuard' })
    })

    it('should fetch guard config only once upon initialization of the same guard multiple times - with different features, priority boosts', async function () {
      mockHubService.fetchServiceConfig.mockImplementation(async () => Promise.resolve({
        version: 'test',
        config: {} as any
      }))

      stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      stanzaGuard({ guard: 'testGuard', priorityBoost: 1 }).bind(() => {
        doStuff()
      })

      stanzaGuard({ guard: 'testGuard', priorityBoost: -1 }).bind(() => {
        doStuff()
      })

      stanzaGuard({ guard: 'testGuard', feature: 'testFeature' }).bind(() => {
        doStuff()
      })

      stanzaGuard({
        guard: 'testGuard',
        tags: [{
          key: 'testTag',
          value: 'testTagValue'
        }]
      }).bind(() => {
        doStuff()
      })

      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledOnce()
      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledWith({ guard: 'testGuard' })
    })

    it('should fetch guard config only once per different guard', async function () {
      mockHubService.fetchServiceConfig.mockImplementation(async () => Promise.resolve({
        version: 'test',
        config: {} as any
      }))

      stanzaGuard({ guard: 'testGuard' }).bind(() => {
        doStuff()
      })

      stanzaGuard({ guard: 'anotherTestGuard' }).bind(() => {
        doStuff()
      })

      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledTimes(2)
      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledWith({ guard: 'testGuard' })
      expect(mockHubService.fetchGuardConfig).toHaveBeenCalledWith({ guard: 'anotherTestGuard' })
    })

    describe('check quota', () => {
      const checkQuotaGuardConfig = {
        version: 'test',
        config: {
          checkQuota: true,
          quotaTags: ['validTag', 'anotherValidTag']
        } satisfies Partial<GuardConfig['config']> as any
      } satisfies GuardConfig

      it('should NOT be pass-through execution after config is fetched', async function () {
        vi.useFakeTimers()

        getQuotaMock.mockImplementationDeferred()
        let resolveConfig: (config: GuardConfig) => void = () => {}
        mockHubService.fetchGuardConfig.mockImplementation(async () => new Promise<GuardConfig>((resolve) => {
          resolveConfig = resolve
        }))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        resolveConfig(checkQuotaGuardConfig)

        await vi.advanceTimersByTimeAsync(0)

        void guardedDoStuff()

        expect(doStuff).not.toHaveBeenCalled()

        vi.useRealTimers()
      })

      it('should return same value as wrapped function when token is granted', async function () {
        vi.useFakeTimers()

        doStuff.mockReturnValueOnce('test-value-token-resolved')

        const deferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(checkQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          return doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = guardedDoStuff()

        deferred.resolve({ granted: true, token: 'test-token' })

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBe('test-value-token-resolved')

        vi.useRealTimers()
      })

      it('should request for token before proceeding with execution', async function () {
        vi.useFakeTimers()

        const deferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(checkQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = guardedDoStuff()

        expect(doStuff).not.toHaveBeenCalled()

        deferred.resolve({ granted: true, token: 'test-token' })

        expect(doStuff).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(0)

        expect(doStuff).toHaveBeenCalledOnce()

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        vi.useRealTimers()
      })

      it('should fail the execution with StanzaGuardError if token is not granted', async function () {
        vi.useFakeTimers()

        const deferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(checkQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = guardedDoStuff()

        expect(doStuff).not.toHaveBeenCalled()

        deferred.resolve({ granted: false })

        await expect(guardedDoStuffPromise).rejects.toThrow(new StanzaGuardError('NoQuota', 'Guard can not be executed'))

        expect(doStuff).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(5000)

        expect(doStuff).not.toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should proceed execution if getting quota returns null', async function () {
        vi.useFakeTimers()

        const deferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(checkQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = guardedDoStuff()

        expect(doStuff).not.toHaveBeenCalled()

        deferred.resolve(null)

        expect(doStuff).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should attach token to an execution context when token is granted', async function () {
        vi.useFakeTimers()

        const deferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(checkQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
          expect(context.active().getValue(stanzaTokenContextKey)).toBe('test-token')
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = guardedDoStuff()

        deferred.resolve({ granted: true, token: 'test-token' })

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should NOT attach token to an execution context when getting quota returns null', async function () {
        vi.useFakeTimers()

        const deferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(checkQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
          expect(context.active().getValue(stanzaTokenContextKey)).toBeUndefined()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = guardedDoStuff()

        deferred.resolve(null)

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })
    })

    describe('validate ingress token', () => {
      const validateIngressTokenGuardConfig = {
        version: 'test',
        config: {
          validateIngressTokens: true
        } satisfies Partial<GuardConfig['config']> as any
      } satisfies GuardConfig

      it('should NOT be pass-through execution after config is fetched', async function () {
        vi.useFakeTimers()

        const configDeferred = mockHubService.fetchGuardConfig.mockImplementationDeferred()
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        configDeferred.resolve(validateIngressTokenGuardConfig)

        await vi.advanceTimersByTimeAsync(0)

        void guardedDoStuff().catch(() => {})

        expect(doStuff).not.toHaveBeenCalled()

        vi.useRealTimers()
      })

      it('should throw error execution after config is fetched and no token is provided in context', async function () {
        vi.useFakeTimers()
        const configDeferred = mockHubService.fetchGuardConfig.mockImplementationDeferred()
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        configDeferred.resolve(validateIngressTokenGuardConfig)

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuff()).rejects.toThrow('Valid Stanza token was not provided')

        vi.useRealTimers()
      })

      it('should return same value as wrapped function when token is validated', async function () {
        vi.useFakeTimers()

        doStuff.mockReturnValueOnce('test-value-token-resolved')

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          return doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({
          token: 'aToken',
          valid: true
        })

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBe('test-value-token-resolved')

        vi.useRealTimers()
      })

      it('should validate token before proceeding with execution', async function () {
        vi.useFakeTimers()

        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        void context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        expect(doStuff).not.toHaveBeenCalled()

        expect(mockHubService.validateToken).toHaveBeenCalledOnce()
        expect(mockHubService.validateToken).toHaveBeenCalledWith({
          guard: 'testGuard',
          token: 'aToken'
        })

        vi.useRealTimers()
      })

      it('should fail the execution with StanzaGuardError if token is not validated', async function () {
        vi.useFakeTimers()
        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        expect(doStuff).not.toHaveBeenCalled()

        validateDeferred.resolve({ token: 'aToken', valid: false })

        await expect(guardedDoStuffPromise).rejects.toThrow(new StanzaGuardError('InvalidToken', 'Provided token was invalid'))

        expect(doStuff).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(5000)

        expect(doStuff).not.toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should proceed the execution if validate token resolves with null', async function () {
        vi.useFakeTimers()

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        expect(doStuff).not.toHaveBeenCalled()

        validateDeferred.resolve(null)

        expect(doStuff).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should proceed execution if validating token throws', async function () {
        vi.useFakeTimers()
        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        expect(doStuff).not.toHaveBeenCalled()

        validateDeferred.reject(new Error('Validating token failed'))

        expect(doStuff).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should proceed execution if validating token takes more than 1000ms', async function () {
        vi.useFakeTimers()

        mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        expect(doStuff).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(1000)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should remove token from an execution context when token is validated', async function () {
        vi.useFakeTimers()

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
          expect(context.active().getValue(stanzaTokenContextKey)).toBeUndefined()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({ token: 'aToken', valid: true })

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should NOT remove token from an execution context when token validating throws', async function () {
        vi.useFakeTimers()

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
          expect(context.active().getValue(stanzaTokenContextKey)).toBeDefined()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.reject(new Error('Getting token failed'))

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })
    })

    describe('validate ingress token & check quota', () => {
      const validateIngressAndCheckQuotaGuardConfig = {
        version: 'test',
        config: {
          checkQuota: true,
          validateIngressTokens: true
        } satisfies Partial<GuardConfig['config']> as any
      } satisfies GuardConfig

      it('should NOT be pass-through execution after config is fetched', async function () {
        vi.useFakeTimers()

        const configDeferred = mockHubService.fetchGuardConfig.mockImplementationDeferred()
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        configDeferred.resolve(validateIngressAndCheckQuotaGuardConfig)

        await vi.advanceTimersByTimeAsync(0)

        void guardedDoStuff().catch(() => {})

        expect(doStuff).not.toHaveBeenCalled()

        vi.useRealTimers()
      })

      it('should throw error execution after config is fetched and no token is provided in context', async function () {
        vi.useFakeTimers()
        const configDeferred = mockHubService.fetchGuardConfig.mockImplementationDeferred()
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        configDeferred.resolve(validateIngressAndCheckQuotaGuardConfig)

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuff()).rejects.toThrow('Valid Stanza token was not provided')

        vi.useRealTimers()
      })

      it('should NOT be pass-through execution immediately when token is validated', async function () {
        vi.useFakeTimers()

        doStuff.mockReturnValueOnce('test-value-token-resolved')

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressAndCheckQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          return doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({
          token: 'aToken',
          valid: true
        })

        await vi.advanceTimersByTimeAsync(0)

        void guardedDoStuffPromise.catch(() => {})

        expect(doStuff).not.toHaveBeenCalled()

        vi.useRealTimers()
      })

      it('should return same value as wrapped function when token is validated and quota given', async function () {
        vi.useFakeTimers()

        doStuff.mockReturnValueOnce('test-value-token-resolved')

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        const getQuotaDeferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressAndCheckQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          return doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({
          token: 'aToken',
          valid: true
        })

        await vi.advanceTimersByTimeAsync(0)

        expect(doStuff).not.toHaveBeenCalled()

        getQuotaDeferred.resolve({ granted: true, token: 'test-token' })

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBe('test-value-token-resolved')

        vi.useRealTimers()
      })

      it('should fail the execution with StanzaGuardError if token is not validated', async function () {
        vi.useFakeTimers()
        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressAndCheckQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        expect(doStuff).not.toHaveBeenCalled()

        validateDeferred.resolve({ token: 'aToken', valid: false })

        await expect(guardedDoStuffPromise).rejects.toThrow(new StanzaGuardError('InvalidToken', 'Provided token was invalid'))

        expect(doStuff).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(5000)

        expect(doStuff).not.toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should fail the execution with StanzaGuardError if ingress token is validated but new token is not granted', async function () {
        vi.useFakeTimers()

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        const getQuotaDeferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressAndCheckQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          return doStuff()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({
          token: 'aToken',
          valid: true
        })

        await vi.advanceTimersByTimeAsync(0)

        getQuotaDeferred.resolve({ granted: false })

        await expect(guardedDoStuffPromise).rejects.toThrow(new StanzaGuardError('NoQuota', 'Guard can not be executed'))

        expect(doStuff).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(5000)

        expect(doStuff).not.toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should remove token from an execution context when token is validated and attach token to an execution context when token is granted', async function () {
        vi.useFakeTimers()

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        const getQuotaDeferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressAndCheckQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
          expect(context.active().getValue(stanzaTokenContextKey)).toBe('new-test-token')
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({ token: 'aToken', valid: true })

        await vi.advanceTimersByTimeAsync(0)

        getQuotaDeferred.resolve({ granted: true, token: 'new-test-token' })

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should remove token from an execution context when token is validated and NOT attach new token to an execution context when getting quota returns null', async function () {
        vi.useFakeTimers()

        const validateDeferred = mockHubService.validateToken.mockImplementationDeferred()
        const getQuotaDeferred = getQuotaMock.mockImplementationDeferred()
        mockHubService.fetchGuardConfig.mockImplementation(async () => Promise.resolve(validateIngressAndCheckQuotaGuardConfig))
        const guardedDoStuff = stanzaGuard({ guard: 'testGuard' }).bind(() => {
          doStuff()
          expect(context.active().getValue(stanzaTokenContextKey)).toBeUndefined()
        })

        // wait for guard config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const guardedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), guardedDoStuff)

        validateDeferred.resolve({ token: 'aToken', valid: true })

        await vi.advanceTimersByTimeAsync(0)

        getQuotaDeferred.resolve(null)

        await vi.advanceTimersByTimeAsync(0)

        await expect(guardedDoStuffPromise).resolves.toBeUndefined()

        expect(doStuff).toHaveBeenCalledOnce()

        vi.useRealTimers()
      })
    })
  })
})
