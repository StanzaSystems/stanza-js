import { context } from '@opentelemetry/api'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockHubService } from '../__tests__/mocks/mockHubService'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'
import { updateDecoratorConfig } from '../global/decoratorConfig'
import { type DecoratorConfig, type StanzaToken, type ValidatedToken } from '../hub/model'
import { stanzaDecorator } from './stanzaDecorator'
import { StanzaDecoratorError } from './stanzaDecoratorError'

const doStuff = vi.fn()

beforeEach(() => {
  updateDecoratorConfig('testDecorator', undefined as any)

  doStuff.mockReset()
  mockHubService.reset()
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
    mockHubService.fetchDecoratorConfig.mockImplementation(async () => {
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
    mockHubService.fetchServiceConfig.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {} as any
    }))

    stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
    })

    expect(mockHubService.fetchDecoratorConfig).toHaveBeenCalledOnce()
  })

  describe('check quota', () => {
    describe('strictSynchronousQuota', () => {
      const checkQuotaDecoratorConfig = {
        version: 'test',
        config: {
          checkQuota: true,
          strictSynchronousQuota: true
        } as any
      } satisfies DecoratorConfig

      it('should NOT be pass-through execution after config is fetched', async function () {
        vi.useFakeTimers()

        let resolveConfig: (config: DecoratorConfig) => void = () => {}
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
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
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<StanzaToken>((resolve) => {
            resolveToken = resolve
          })
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
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
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<StanzaToken>((resolve) => {
            resolveToken = resolve
          })
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
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
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<StanzaToken>((resolve) => {
            resolveToken = resolve
          })
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
        const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
          doStuff()
        })

        // wait for decorator config to be initialized
        await vi.advanceTimersByTimeAsync(0)

        const decoratedDoStuffPromise = decoratedDoStuff()

        expect(doStuff).not.toHaveBeenCalled()

        resolveToken({ granted: false })

        await expect(decoratedDoStuffPromise).rejects.toThrow(new StanzaDecoratorError('NoQuota', 'Decorator can not be executed'))

        expect(doStuff).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(5000)

        expect(doStuff).not.toHaveBeenCalledOnce()

        vi.useRealTimers()
      })

      it('should proceed execution if getting token throws', async function () {
        vi.useFakeTimers()
        let rejectToken: (reason: Error) => void = () => {}
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<never>((_resolve, reject) => {
            rejectToken = reject
          })
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
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
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<never>(() => {})
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
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
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<StanzaToken>((resolve) => {
            resolveToken = resolve
          })
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
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
        mockHubService.getToken.mockImplementation(async () => {
          return new Promise<never>((_resolve, reject) => {
            rejectToken = reject
          })
        })
        mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(checkQuotaDecoratorConfig))
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
  })

  describe('validate ingress token', () => {
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
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
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
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
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

      let resolveValidatedToken: (value: ValidatedToken) => void = () => {}
      mockHubService.validateToken.mockImplementation(async () => {
        return new Promise<ValidatedToken>((resolve) => {
          resolveValidatedToken = resolve
        })
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        return doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      resolveValidatedToken({
        token: 'aToken',
        valid: true
      })

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBe('test-value-token-resolved')

      vi.useRealTimers()
    })

    it('should validate token before proceeding with execution', async function () {
      vi.useFakeTimers()

      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      void context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      expect(mockHubService.validateToken).toHaveBeenCalledOnce()
      expect(mockHubService.validateToken).toHaveBeenCalledWith({
        decorator: 'testDecorator',
        token: 'aToken'
      })

      vi.useRealTimers()
    })

    it('should fail the execution with StanzaDecoratorError if token is not validated', async function () {
      vi.useFakeTimers()
      let resolveValidatedToken: (value: ValidatedToken) => void = () => {}
      mockHubService.validateToken.mockImplementation(async () => {
        return new Promise<ValidatedToken>((resolve) => {
          resolveValidatedToken = resolve
        })
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      resolveValidatedToken({ token: 'aToken', valid: false })

      await expect(decoratedDoStuffPromise).rejects.toThrow(new StanzaDecoratorError('InvalidToken', 'Provided token was invalid'))

      expect(doStuff).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(5000)

      expect(doStuff).not.toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should proceed the execution if validate token resolves with null', async function () {
      vi.useFakeTimers()

      let resolveValidatedToken: (value: ValidatedToken | null) => void = () => {}
      mockHubService.validateToken.mockImplementation(async () => {
        return new Promise<ValidatedToken | null>((resolve) => {
          resolveValidatedToken = resolve
        })
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      expect(doStuff).not.toHaveBeenCalled()

      resolveValidatedToken(null)

      expect(doStuff).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should proceed execution if validating token throws', async function () {
      vi.useFakeTimers()
      let rejectValidateToken: (reason: Error) => void = () => {}
      mockHubService.validateToken.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectValidateToken = reject
        })
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
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

      mockHubService.getToken.mockImplementation(async () => {
        return new Promise<never>(() => {})
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
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

      let resolveValidatedToken: (value: ValidatedToken) => void = () => {}
      mockHubService.validateToken.mockImplementation(async () => {
        return new Promise<ValidatedToken>((resolve) => {
          resolveValidatedToken = resolve
        })
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        doStuff()
        expect(context.active().getValue(stanzaTokenContextKey)).toBeUndefined()
      })

      // wait for decorator config to be initialized
      await vi.advanceTimersByTimeAsync(0)

      const decoratedDoStuffPromise = context.with(context.active().setValue(stanzaTokenContextKey, 'aToken'), decoratedDoStuff)

      resolveValidatedToken({ token: 'aToken', valid: true })

      await vi.advanceTimersByTimeAsync(0)

      await expect(decoratedDoStuffPromise).resolves.toBeUndefined()

      expect(doStuff).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('should NOT remove token from an execution context when token validating throws', async function () {
      vi.useFakeTimers()

      let rejectValidateToken: (reason: Error) => void = () => {}
      mockHubService.validateToken.mockImplementation(async () => {
        return new Promise<never>((_resolve, reject) => {
          rejectValidateToken = reject
        })
      })
      mockHubService.fetchDecoratorConfig.mockImplementation(async () => Promise.resolve(validateIngressTokenDecoratorConfig))
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
