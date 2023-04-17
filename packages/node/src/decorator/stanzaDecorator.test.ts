import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateHubService } from '../global'
import { stanzaDecorator } from './stanzaDecorator'

const fetchServiceConfigMock = vi.fn()
const fetchDecoratorConfigMock = vi.fn()
const getTokenMock = vi.fn()

const doStuff = vi.fn()

beforeEach(() => {
  fetchServiceConfigMock.mockReset()
  fetchDecoratorConfigMock.mockReset()
  getTokenMock.mockReset()
  doStuff.mockReset()
  updateHubService({
    fetchServiceConfig: fetchServiceConfigMock,
    fetchDecoratorConfig: fetchDecoratorConfigMock,
    getToken: getTokenMock
  })
})
describe('stanzaDecorator', function () {
  it('should pass-through execution initially', async function () {
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }, () => {
      doStuff()
    })

    await decoratedDoStuff()
    expect(doStuff).toHaveBeenCalledOnce()
  })

  it('should fetch decorator config upon initialization', async function () {
    fetchServiceConfigMock.mockImplementation(async () => ({}))

    stanzaDecorator({ decorator: 'testDecorator' }, () => {
      doStuff()
    })

    expect(fetchDecoratorConfigMock).toHaveBeenCalledOnce()
  })

  it('should request for token before proceeding with execution', async function () {
    vi.useFakeTimers()
    let resolveToken: (value: { granted: boolean, token: string }) => void = () => {}
    getTokenMock.mockImplementation(async () => {
      return new Promise((resolve) => {
        resolveToken = resolve
      })
    })
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }, () => {
      doStuff()
    })

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
    let resolveToken: (value: { granted: boolean, token?: string }) => void = () => {}
    getTokenMock.mockImplementation(async () => {
      return new Promise((resolve) => {
        resolveToken = resolve
      })
    })
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }, () => {
      doStuff()
    })

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
      return new Promise((_resolve, reject) => {
        rejectToken = reject
      })
    })
    const decoratedDoStuff = stanzaDecorator({ decorator: 'testDecorator' }, () => {
      doStuff()
    })

    void decoratedDoStuff()

    expect(doStuff).not.toHaveBeenCalled()

    rejectToken(new Error('Getting token failed'))

    expect(doStuff).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)

    expect(doStuff).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})
