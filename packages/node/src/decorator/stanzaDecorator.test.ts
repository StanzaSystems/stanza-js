import { context } from '@opentelemetry/api'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'
import { updateDecoratorConfig } from '../global/decoratorConfig'
import { updateHubService } from '../global/hubService'
import { type HubService } from '../hub/hubService'
import { type DecoratorConfig, type ServiceConfig, type StanzaToken, type ValidatedTokens } from '../hub/model'
import { stanzaDecorator } from './stanzaDecorator'
import { StanzaDecoratorError } from './stanzaDecoratorError'

const fetchServiceConfigMock = vi.fn<any[], Promise<ServiceConfig | null>>(async () => new Promise<never>(() => {}))
const fetchDecoratorConfigMock = vi.fn<any[], Promise<DecoratorConfig | null>>(async () => new Promise<never>(() => {}))
const getTokenMock = vi.fn<any[], Promise<StanzaToken | null>>(async () => new Promise<never>(() => {}))
const validateTokenMock = vi.fn<Parameters<HubService['validateToken']>, Promise<ValidatedTokens | null>>(async () => new Promise<never>(() => {}))

const doStuff = vi.fn()

beforeEach(() => {
  updateDecoratorConfig('testDecorator', undefined as any)

  fetchServiceConfigMock.mockReset()
  fetchDecoratorConfigMock.mockReset()
  getTokenMock.mockReset()
  validateTokenMock.mockReset()
  doStuff.mockReset()

  fetchServiceConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
  fetchDecoratorConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
  getTokenMock.mockImplementation(async () => new Promise<never>(() => {}))
  validateTokenMock.mockImplementation(async () => new Promise<never>(() => {}))

  updateHubService({
    fetchServiceConfig: fetchServiceConfigMock,
    fetchDecoratorConfig: fetchDecoratorConfigMock,
    getToken: getTokenMock,
    validateToken: validateTokenMock
  })
})

beforeAll(() => {
  const contextManager = new AsyncHooksContextManager()
  contextManager.enable()
  context.setGlobalContextManager(contextManager)
})

describe('stanzaDecorator', function () {
  it('should pass-through execution initially', async function () {
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
    })

    const decoratedDoStuffPromise = decoratedDoStuff()

    await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

    expect(doStuff).toHaveBeenCalledOnce()
  })

  it('should pass-through execution initially and return same value as wrapped function', async function () {
    doStuff.mockReturnValueOnce('test-value')
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      return doStuff()
    })

    const decoratedDoStuffPromise = decoratedDoStuff()

    await expect(decoratedDoStuffPromise).resolves.toBe('test-value')

    expect(doStuff).toHaveBeenCalledOnce()
  })

  it('should continue pass-through execution if getting config fails', async function () {
    vi.useFakeTimers()

    let rejectConfig: (reason: Error) => void = () => {
      expect.fail('should not be called')
    }
    fetchDecoratorConfigMock.mockImplementation(async () => {
      return new Promise<never>((_resolve, reject) => {
        rejectConfig = reject
      })
    })
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
    })

    rejectConfig(new Error('Getting decorator config failed'))

    await vi.advanceTimersByTimeAsync(0)

    const decoratedDoStuffPromise = decoratedDoStuff()

    await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

    expect(doStuff).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('should fetch decorator config upon initialization', async function () {
    fetchServiceConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {} as any
    }))

    stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
    })

    expect(fetchDecoratorConfigMock).toHaveBeenCalledOnce()
  })

  describe('check quota', () => {
    const checkQuotaDecoratorConfig = {
      version: 'test',
      config: {
        checkQuota: true
      } as any
    } satisfies DecoratorConfig

    it('should NOT be pass-through execution after config is fetched', async function () {
      vi.useFakeTimers()

      let resolveConfig: (config: DecoratorConfig) => void = () => {}
      fetchDecoratorConfigMock.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
        resolveConfig = resolve
      }))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      resolveConfig(checkQuotaDecoratorConfig)

      await vi.advanceTimersByTimeAsync(0)

      void decoratedDoStuff()

      expect(doStuff).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should return same value as wrapped function when token is granted', async function () {
      vi.useFakeTimers()

      doStuff.mockReturnValueOnce('test-value-token-resolved')

      let resolveToken: (value: { granted: boolean, token: string }) => void = () => {}
      getTokenMock.mockImplementation(async () => {
        return new Promise<StanzaToken>((resolve) => {
          resolveToken = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        return doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      resolveToken({ granted: true, token: 'test-token' })

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBe('test-value-token-resolved')

      vi.useRealTimers()
    })

    it('should request for token before proceeding with execution', async function () {
      vi.useFakeTimers()

      let resolveToken: (value: { granted: boolean, token: string }) => void = () => {}
      getTokenMock.mockImplementation(async () => {
        return new Promise<StanzaToken>((resolve) => {
          resolveToken = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      expect(doStuff).not.toHaveBeenCalled()

      resolveToken({ granted: true, token: 'test-token' })

      expect(doStuff).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(0)

      expect(doStuff).toHaveBeenCalledOnce()

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      vi.useRealTimers()
    })

    it('should fail the execution with StanzaDecoratorError if token is not granted', async function () {
      vi.useFakeTimers()
      let resolveToken: (value: StanzaToken) => void = () => {}
      getTokenMock.mockImplementation(async () => {
        return new Promise<StanzaToken>((resolve) => {
          resolveToken = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      expect(doStuff).not.toHaveBeenCalled()

      resolveToken({ granted: false })

      await expect(decoratedDoStuffPromise).rejects.toThrow(new StanzaDecoratorError('TooManyRequests', 'Decorator can not be executed'))

      expect(doStuff).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(5000)

      expect(doStuff).not.toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should proceed execution if getting token throws', async function () {
      vi.useFakeTimers()
      let rejectToken: (reason: Error) => void = () => {}
      getTokenMock.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectToken = reject
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      expect(doStuff).not.toHaveBeenCalled()

      rejectToken(new Error('Getting token failed'))

      expect(doStuff).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should proceed execution if getting token takes more than 1000ms', async function () {
      vi.useFakeTimers()
      getTokenMock.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      expect(doStuff).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1000)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should attach token to an execution context when token is granted', async function () {
      vi.useFakeTimers()

      let resolveToken: (value: { granted: boolean, token: string }) => void = () => {}
      getTokenMock.mockImplementation(async () => {
        return new Promise<StanzaToken>((resolve) => {
          resolveToken = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
        expect(context.active().getValue(stanzaTokenContextKey)).toBe('test-token')
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      resolveToken({ granted: true, token: 'test-token' })

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should NOT attach token to an execution context when token fetching throws', async function () {
      vi.useFakeTimers()

      let rejectToken: (reason: Error) => void = () => {}
      getTokenMock.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectToken = reject
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
        expect(context.active().getValue(stanzaTokenContextKey)).toBeUndefined()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = decoratedDoStuff()

      rejectToken(new Error('Getting token failed'))

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })
  })

  describe('check quota', () => {
    const validateIngressTokenDecoratorConfig = {
      version: 'test',
      config: {
        validateIngressTokens: true
      } as any
    } satisfies DecoratorConfig

    it('should NOT be pass-through execution after config is fetched', async function () {
      vi.useFakeTimers()

      let resolveConfig: (config: DecoratorConfig) => void = () => {
      }
      fetchDecoratorConfigMock.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
        resolveConfig = resolve
      }))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      resolveConfig(validateIngressTokenDecoratorConfig)

      await vi.advanceTimersByTimeAsync(0)

      void decoratedDoStuff().catch(() => {})

      expect(doStuff).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should throw error execution after config is fetched and no token is provided in context', async function () {
      vi.useFakeTimers()
      let resolveConfig: (config: DecoratorConfig) => void = () => {
      }
      fetchDecoratorConfigMock.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
        resolveConfig = resolve
      }))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      resolveConfig(validateIngressTokenDecoratorConfig)

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuff()).rejects.toThrow('Valid Stanza token was not provided')

      vi.useRealTimers()
    })

    it('should return same value as wrapped function when token is validated', async function () {
      vi.useFakeTimers()

      doStuff.mockReturnValueOnce('test-value-token-resolved')

      let resolveValidatedTokens: (value: ValidatedTokens) => void = () => {}
      validateTokenMock.mockImplementation(async () => {
        return new Promise<ValidatedTokens>((resolve) => {
          resolveValidatedTokens = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        return doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      resolveValidatedTokens([{
        token: 'aToken',
        valid: true
      }])

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBe('test-value-token-resolved')

      vi.useRealTimers()
    })

    it('should validate token before proceeding with execution', async function () {
      vi.useFakeTimers()

      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      void context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      expect(validateTokenMock).toHaveBeenCalledOnce()
      expect(validateTokenMock).toHaveBeenCalledWith({
        decorator: 'testDecorator',
        token: 'aToken'
      })

      vi.useRealTimers()
    })

    it('should fail the execution with StanzaDecoratorError if token is not validated', async function () {
      vi.useFakeTimers()
      let resolveValidatedTokens: (value: ValidatedTokens) => void = () => {}
      validateTokenMock.mockImplementation(async () => {
        return new Promise<ValidatedTokens>((resolve) => {
          resolveValidatedTokens = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      resolveValidatedTokens([{ token: 'aToken', valid: false }])

      await expect(decoratedDoStuffPromise).rejects.toThrow(new StanzaDecoratorError('InvalidToken', 'Provided token was invalid'))

      expect(doStuff).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(5000)

      expect(doStuff).not.toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should fail the execution with StanzaDecoratorError if validate token resolves with empty array', async function () {
      vi.useFakeTimers()

      let resolveValidatedTokens: (value: ValidatedTokens) => void = () => {}
      validateTokenMock.mockImplementation(async () => {
        return new Promise<ValidatedTokens>((resolve) => {
          resolveValidatedTokens = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      resolveValidatedTokens([])

      await expect(decoratedDoStuffPromise).rejects.toThrow(new StanzaDecoratorError('InvalidToken', 'Provided token was invalid'))

      expect(doStuff).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(5000)

      expect(doStuff).not.toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should proceed execution if validating token throws', async function () {
      vi.useFakeTimers()
      let rejectValidateToken: (reason: Error) => void = () => {}
      validateTokenMock.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectValidateToken = reject
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      rejectValidateToken(new Error('Validating token failed'))

      expect(doStuff).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should proceed execution if validating token takes more than 1000ms', async function () {
      vi.useFakeTimers()

      getTokenMock.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1000)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should remove token from an execution context when token is validated', async function () {
      vi.useFakeTimers()

      let resolveValidatedTokens: (value: ValidatedTokens) => void = () => {}
      validateTokenMock.mockImplementation(async () => {
        return new Promise<ValidatedTokens>((resolve) => {
          resolveValidatedTokens = resolve
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
        expect(context.active().getValue(stanzaTokenContextKey)).toBeUndefined()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      resolveValidatedTokens([{ token: 'aToken', valid: true }])

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should NOT remove token from an execution context when token validating throws', async function () {
      vi.useFakeTimers()

      let rejectValidateToken: (reason: Error) => void = () => {}
      validateTokenMock.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectValidateToken = reject
        })
      })
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
        expect(context.active().getValue(stanzaTokenContextKey)).toBeDefined()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      rejectValidateToken(new Error('Getting token failed'))

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })
  })
})
