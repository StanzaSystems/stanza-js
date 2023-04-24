import { describe, expect, it, vi } from 'vitest'
import { startPolling } from './startPolling'

describe('startPolling', function () {
  it('should run function immediately', () => {
    const aFunction = vi.fn(async () => Promise.resolve())
    void startPolling(aFunction)

    expect(aFunction).toHaveBeenCalledOnce()
  })

  it('should run function after specified polling time elapses', async () => {
    vi.useFakeTimers()

    const aFunction = vi.fn(async () => Promise.resolve())

    void startPolling(aFunction, { pollInterval: 1000 })

    expect(aFunction).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(1000)

    expect(aFunction).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })

  it('should run function every specified polling time elapses', async () => {
    vi.useFakeTimers()

    const aFunction = vi.fn(async () => Promise.resolve())

    void startPolling(aFunction, { pollInterval: 1000 })

    expect(aFunction).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(1000)

    expect(aFunction).toHaveBeenCalledTimes(2)

    await vi.advanceTimersByTimeAsync(1000)

    expect(aFunction).toHaveBeenCalledTimes(3)

    vi.useRealTimers()
  })

  it('should return a function to stop polling', async () => {
    vi.useFakeTimers()

    const aFunction = vi.fn(async () => Promise.resolve())

    const { stopPolling } = startPolling(aFunction, { pollInterval: 1000 })

    expect(aFunction).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(1000)

    expect(aFunction).toHaveBeenCalledTimes(2)

    stopPolling()

    await vi.advanceTimersByTimeAsync(1000)

    expect(aFunction).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})
