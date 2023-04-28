import { context } from '@opentelemetry/api'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaApiKeyContextKey } from '../context/stanzaApiKeyContextKey'
import { updateHubService } from '../global/hubService'
import { type DecoratorConfig, type ServiceConfig, type StanzaToken } from '../hub/model'
import { stanzaDecorator } from './stanzaDecorator'

const fetchServiceConfigMock = vi.fn<any[], Promise<ServiceConfig | null>>(async () => new Promise<never>(() => {}))
const fetchDecoratorConfigMock = vi.fn<any[], Promise<DecoratorConfig | null>>(async () => new Promise<never>(() => {}))
const getTokenMock = vi.fn<any[], Promise<StanzaToken | null>>(async () => new Promise<never>(() => {}))

const doStuff = vi.fn()

beforeEach(() => {
  fetchServiceConfigMock.mockClear()
  fetchDecoratorConfigMock.mockClear()
  getTokenMock.mockClear()
  doStuff.mockClear()

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

    void decoratedDoStuff()

    expect(doStuff).toHaveBeenCalledOnce()
  })

  it('should continue pass-through execution if getting config fails', async function () {
    vi.useFakeTimers()

    let rejectConfig: (reason: Error) => void = () => {}
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

    void decoratedDoStuff()

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

    void decoratedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    resolveToken({ granted: true, token: 'test-token' })

    expect(doStuff).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(0)

    expect(doStuff).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('should NOT proceed execution if token is not granted', async function () {
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

    void decoratedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    resolveToken({ granted: false })

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

    void decoratedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    rejectToken(new Error('Getting token failed'))

    expect(doStuff).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)

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

    void decoratedDoStuff()

    resolveToken({ granted: true, token: 'test-token' })

    await vi.advanceTimersByTimeAsync(0)

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

    void decoratedDoStuff()

    rejectToken(new Error('Getting token failed'))

    await vi.advanceTimersByTimeAsync(0)

    expect(doStuff).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})
