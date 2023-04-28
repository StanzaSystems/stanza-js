import { context } from '@opentelemetry/api'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaApiKeyContextKey } from '../context/stanzaApiKeyContextKey'
import { updateDecoratorConfig } from '../global/decoratorConfig'
import { updateHubService } from '../global/hubService'
import { type DecoratorConfig, type ServiceConfig, type StanzaToken } from '../hub/model'
import { stanzaDecorator } from './stanzaDecorator'
import { StanzaDecoratorError } from './stanzaDecoratorError'

const fetchServiceConfigMock = vi.fn<any[], Promise<ServiceConfig | null>>(async () => new Promise<never>(() => {}))
const fetchDecoratorConfigMock = vi.fn<any[], Promise<DecoratorConfig | null>>(async () => new Promise<never>(() => {}))
const getTokenMock = vi.fn<any[], Promise<StanzaToken | null>>(async () => new Promise<never>(() => {}))

const doStuff = vi.fn()

beforeEach(() => {
  updateDecoratorConfig('testDecorator', undefined as any)

  fetchServiceConfigMock.mockReset()
  fetchDecoratorConfigMock.mockReset()
  getTokenMock.mockReset()
  doStuff.mockReset()

  fetchServiceConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
  fetchDecoratorConfigMock.mockImplementation(async () => new Promise<never>(() => {}))
  getTokenMock.mockImplementation(async () => new Promise<never>(() => {}))

  updateHubService({
    fetchServiceConfig: fetchServiceConfigMock,
    fetchDecoratorConfig: fetchDecoratorConfigMock,
    getToken: getTokenMock
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

  it('should NOT be pass-through execution after config is fetched', async function () {
    vi.useFakeTimers()

    let resolveConfig: (config: DecoratorConfig) => void = () => {}
    fetchDecoratorConfigMock.mockImplementation(async () => new Promise<DecoratorConfig>((resolve) => {
      resolveConfig = resolve
    }))
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
    })

    resolveConfig({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    })

    await vi.advanceTimersByTimeAsync(0)

    void decoratedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

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
    fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    }))
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
    fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    }))
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
    })

    // wait for decorator config to be initialized
    await vi.advanceTimersByTimeAsync(0)

    const decoratedDoStuffPromise = decoratedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    resolveToken({ granted: false })

    await expect(decoratedDoStuffPromise).rejects.toThrow(new StanzaDecoratorError('TooManyRequests', 'Decorator can\'t be executed'))

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
    fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    }))
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
    fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    }))
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
    fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    }))
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
      expect(context.active().getValue(stanzaApiKeyContextKey)).toBe('test-token')
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
    fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
      version: 'test',
      config: {
        checkQuota: true
      } as any
    }))
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
      doStuff()
      expect(context.active().getValue(stanzaApiKeyContextKey)).toBeUndefined()
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

  describe('return value', () => {
    it('should pass-through execution initially and return same value as wrapped function', async function () {
      doStuff.mockReturnValueOnce('test-value')
      const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }).bind(() => {
        return doStuff()
      })

      const decoratedDoStuffPromise = decoratedDoStuff()

      await expect(decoratedDoStuffPromise).resolves.toBe('test-value')

      expect(doStuff).toHaveBeenCalledOnce()
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
      fetchDecoratorConfigMock.mockImplementation(async () => Promise.resolve({
        version: 'test',
        config: {
          checkQuota: true
        } as any
      }))
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
  })
})
