import { backoffGetQuota } from './backoffGetQuota'
import { afterEach, expect } from 'vitest'
import { eventBus, events } from '../global/eventBus'

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

  it('should pass through to original fn initially after couple of seconds', async () => {
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

    for (let i = 0; i < 10; i++) {
      await eventBus.emit(events.internal.quota.succeeded)
    }
    await eventBus.emit(events.internal.quota.failed)

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
      for (let i = 0; i < 10; i++) {
        await eventBus.emit(events.internal.quota.succeeded)
      }
      await eventBus.emit(events.internal.quota.failed)

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

    for (let i = 0; i < 89; i++) {
      await eventBus.emit(events.internal.quota.succeeded)
    }
    for (let i = 0; i < 11; i++) {
      await eventBus.emit(events.internal.quota.failed)
    }

    await vi.advanceTimersByTimeAsync(1000)

    const promise = getQuotaBackedOff()

    expect(getQuotaMock).not.toHaveBeenCalled()
    await expect(promise).resolves.toBe(null)
  })

  it('should not pass through to original fn if fail rate goes above 10% after a second', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    for (let i = 0; i < 95; i++) {
      await eventBus.emit(events.internal.quota.succeeded)
    }
    for (let i = 0; i < 5; i++) {
      await eventBus.emit(events.internal.quota.failed)
    }

    await vi.advanceTimersByTimeAsync(1000)

    const firstPromise = getQuotaBackedOff()

    expect(getQuotaMock).toHaveBeenCalledOnce()
    await expect(firstPromise).resolves.toBe('ok')

    getQuotaMock.mockClear()

    for (let i = 0; i < 89; i++) {
      await eventBus.emit(events.internal.quota.succeeded)
    }
    for (let i = 0; i < 11; i++) {
      await eventBus.emit(events.internal.quota.failed)
    }

    await vi.advanceTimersByTimeAsync(1000)

    const promise = getQuotaBackedOff()

    expect(getQuotaMock).not.toHaveBeenCalled()
    await expect(promise).resolves.toBe(null)
  })

  it.skip('should enable 1% of requests to pass through after 1 second back off', async () => {
    vi.useFakeTimers()

    const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
    const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

    for (let i = 0; i < 89; i++) {
      await eventBus.emit(events.internal.quota.succeeded)
    }
    for (let i = 0; i < 11; i++) {
      await eventBus.emit(events.internal.quota.failed)
    }

    await vi.advanceTimersByTimeAsync(1000)

    for (let i = 0; i < 100; i++) {
      await getQuotaBackedOff()
    }

    expect(getQuotaMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)

    for (let i = 0; i < 100; i++) {
      await getQuotaBackedOff()
    }

    expect(getQuotaMock).toHaveBeenCalledOnce()
  })
})
