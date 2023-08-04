import { backoffGetQuota } from './backoffGetQuota'
import { afterEach, expect } from 'vitest'
import { eventBus, events } from '../global/eventBus'

const emitTimes = async (count: number, emitFn: () => Promise<unknown>): Promise<void> => {
  for (let i = 0; i < count; i++) {
    await emitFn()
  }
}
const emitFailures = async (count: number): Promise<void> => {
  await emitTimes(count, async () => eventBus.emit(events.internal.quota.failed))
}
const emitSuccesses = async (count: number): Promise<void> => {
  await emitTimes(count, async () => eventBus.emit(events.internal.quota.succeeded))
}

describe('backoffGetQuota', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should pass through to original fn initially', async () => {
    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    const promise = getQuotaBackedOff()

    expect(getQuotaMock).toHaveBeenCalledOnce()
    await expect(promise).resolves.toBe('ok')
  })

  it('should pass through to original fn after couple of seconds', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    for (let i = 0; i < 5; i++) {
      getQuotaMock.mockClear()
      const promise = getQuotaBackedOff()

      expect(getQuotaMock).toHaveBeenCalledOnce()
      await expect(promise).resolves.toBe('ok')

      await vi.advanceTimersByTimeAsync(1000)
    }
  })

  it('should pass through to original fn if fail rate is below 10%', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    await emitSuccesses(10)
    await emitFailures(1)

    const promise = getQuotaBackedOff()

    expect(getQuotaMock).toHaveBeenCalledOnce()
    await expect(promise).resolves.toBe('ok')
  })

  it('should pass through if fail rate is consistently below 10%', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    for (let secondCount = 0; secondCount < 5; secondCount++) {
      getQuotaMock.mockClear()
      await emitSuccesses(10)
      await emitFailures(1)
      await vi.advanceTimersByTimeAsync(1000)

      const promise = getQuotaBackedOff()

      expect(getQuotaMock).toHaveBeenCalledOnce()
      await expect(promise).resolves.toBe('ok')
    }
  })

  it('should not pass through to original fn if fail rate is 10%', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    await emitSuccesses(89)
    await emitFailures(11)

    await vi.advanceTimersByTimeAsync(1000)

    const promise = getQuotaBackedOff()

    expect(getQuotaMock).not.toHaveBeenCalled()
    await expect(promise).resolves.toBe(null)
  })

  it('should not pass through to original fn if fail rate goes above 10% after a second', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    await emitSuccesses(95)
    await emitFailures(5)

    await vi.advanceTimersByTimeAsync(1000)

    const firstPromise = getQuotaBackedOff()

    expect(getQuotaMock).toHaveBeenCalledOnce()
    await expect(firstPromise).resolves.toBe('ok')

    getQuotaMock.mockClear()

    await emitSuccesses(89)
    await emitFailures(11)

    await vi.advanceTimersByTimeAsync(1000)

    const promise = getQuotaBackedOff()

    expect(getQuotaMock).not.toHaveBeenCalled()
    await expect(promise).resolves.toBe(null)
  })

  it('should enable 1% of requests to pass through after 1 second back off', async () => {
    vi.useFakeTimers()
    const randomSpy = vi.spyOn(Math, 'random')

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    await emitSuccesses(89)
    await emitFailures(11)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).not.toHaveBeenCalled()

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    randomSpy.mockReturnValue(0.99).mockReturnValueOnce(0.01)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledOnce()
  })

  it('should gradually re-enable requests to pass through to original get quota function ', async () => {
    vi.useFakeTimers()
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.99)

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    await emitSuccesses(89)
    await emitFailures(11)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).not.toHaveBeenCalled()

    // ramp up to 1%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    randomSpy.mockReturnValueOnce(0.01)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledOnce()

    getQuotaMock.mockClear()

    // ramp up to 5%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(5, async () => {
      randomSpy.mockReturnValueOnce(0.05)
    })

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(5)

    getQuotaMock.mockClear()

    // ramp up to 10%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(10, async () => {
      randomSpy.mockReturnValueOnce(0.1)
    })

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(10)

    getQuotaMock.mockClear()

    // ramp up to 25%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(25, async () => {
      randomSpy.mockReturnValueOnce(0.25)
    })

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(25)

    getQuotaMock.mockClear()

    // ramp up to 50%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(50, async () => {
      randomSpy.mockReturnValueOnce(0.5)
    })

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(50)

    getQuotaMock.mockClear()

    // ramp up to 100%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(100)

    getQuotaMock.mockClear()
  })

  it.skip('should exponentially back off in case of repetitive failure', async () => {
    vi.useFakeTimers()
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.99)

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    await emitSuccesses(89)
    await emitFailures(11)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).not.toHaveBeenCalled()

    // ramp up to 1%

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    randomSpy.mockReturnValueOnce(0.01)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledOnce()

    getQuotaMock.mockClear()

    // fail again

    await emitSuccesses(89)
    await emitFailures(11)

    await vi.advanceTimersByTimeAsync(1000)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).not.toHaveBeenCalled()

    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)

    randomSpy.mockReturnValueOnce(0)

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).not.toHaveBeenCalled()
  })
})
