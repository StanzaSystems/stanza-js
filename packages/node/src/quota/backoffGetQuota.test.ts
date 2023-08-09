import { backoffGetQuota } from './backoffGetQuota'
import { afterEach, beforeEach, expect, vi } from 'vitest'
import { eventBus, events } from '../global/eventBus'
import { logger } from '../global/logger'

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
  const randomSpy = vi.spyOn(Math, 'random')
  const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
  let getQuotaBackedOff: ReturnType<typeof backoffGetQuota>
  let emitSpy = vi.spyOn(eventBus, 'emit')

  beforeEach(() => {
    vi.useFakeTimers()
    randomSpy.mockReset()
    emitSpy.mockRestore()
    emitSpy = vi.spyOn(eventBus, 'emit')
    getQuotaMock.mockReset()
    getQuotaBackedOff = backoffGetQuota(getQuotaMock)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('flow control', () => {
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

    it('should gradually re-enable requests to pass through to original get quota function when emits successful events', async () => {
      vi.useFakeTimers()
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

    it('should gradually re-enable requests to pass through to original get quota function when emits no events at all', async () => {
      vi.useFakeTimers()
      randomSpy.mockReturnValue(0.99)

      const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
      const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      // ramp up to 1%

      await vi.advanceTimersByTimeAsync(1000)

      randomSpy.mockReturnValueOnce(0.01)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledOnce()

      getQuotaMock.mockClear()

      // ramp up to 5%

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(5, async () => {
        randomSpy.mockReturnValueOnce(0.05)
      })

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledTimes(5)

      getQuotaMock.mockClear()

      // ramp up to 10%

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(10, async () => {
        randomSpy.mockReturnValueOnce(0.1)
      })

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledTimes(10)

      getQuotaMock.mockClear()

      // ramp up to 25%

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(25, async () => {
        randomSpy.mockReturnValueOnce(0.25)
      })

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledTimes(25)

      getQuotaMock.mockClear()

      // ramp up to 50%

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(50, async () => {
        randomSpy.mockReturnValueOnce(0.5)
      })

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledTimes(50)

      getQuotaMock.mockClear()

      // ramp up to 100%

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledTimes(100)

      getQuotaMock.mockClear()
    })

    it('should exponentially back off in case of repetitive failure', async () => {
      vi.useFakeTimers()
      randomSpy.mockReturnValue(0.99)

      const getQuotaMock = vi.fn(async () => Promise.resolve('ok'))
      const getQuotaBackedOff = backoffGetQuota(getQuotaMock)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - start

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      // ramp up to 1% after 1 second

      await emitSuccesses(1)

      await vi.advanceTimersByTimeAsync(1000)

      randomSpy.mockReturnValueOnce(0.01)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledOnce()

      getQuotaMock.mockClear()

      // fail again

      await emitFailures(1)

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - start

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - after 1 sec

      randomSpy.mockReturnValueOnce(0)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      randomSpy.mockReset()
      randomSpy.mockReturnValue(0.99)

      // ramp up to 1% after 2 seconds

      await vi.advanceTimersByTimeAsync(1000)

      randomSpy.mockReturnValueOnce(0.01)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledOnce()

      getQuotaMock.mockClear()

      // fail again

      await emitFailures(1)

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - start

      randomSpy.mockReturnValue(0)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - after 1 sec

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - after 2 sec

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - after 3 sec

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      randomSpy.mockReset()
      randomSpy.mockReturnValue(0.99)

      // ramp up to 1% after 4 seconds

      await vi.advanceTimersByTimeAsync(1000)

      randomSpy.mockReturnValueOnce(0.01)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledOnce()
    })

    it('should back off again if fail rate goes above 10% while re-enabling', async () => {
      vi.useFakeTimers()
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

      // fail

      await emitFailures(1)

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, async () => {
        randomSpy.mockReturnValueOnce(0)
      })

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      getQuotaMock.mockClear()

      // ramp up to 1%

      await emitSuccesses(1)

      await vi.advanceTimersByTimeAsync(1000)

      randomSpy.mockReset()
      randomSpy.mockReturnValue(0.99)
      randomSpy.mockReturnValueOnce(0.01)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).toHaveBeenCalledOnce()
    })

    it('should go through the whole disable/re-enable cycle twice', async () => {
      randomSpy.mockReturnValue(0.99)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      await expectWholeRampUpCycle()

      await emitTimes(10, async () => {
        await emitSuccesses(100)

        await vi.advanceTimersByTimeAsync(1000)

        await emitTimes(100, getQuotaBackedOff)

        expect(getQuotaMock).toHaveBeenCalledTimes(100)

        getQuotaMock.mockClear()
      })

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      await expectWholeRampUpCycle()
    })
  })

  describe('events', () => {
    it('should emit quota disabled event if fail rate is over 10%', async () => {
      emitSpy.mockClear()
      await emitSuccesses(89)
      await emitFailures(11)
      emitSpy.mockClear()

      await vi.advanceTimersByTimeAsync(1000)
      expect(emitSpy).toHaveBeenCalledOnce()
      expect(emitSpy).toHaveBeenCalledWith(events.internal.quota.disabled)
    })

    it('should emit quota disabled event in case of repetitive failure', async () => {
      randomSpy.mockReturnValue(0.99)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      // enabled percent 0 - start

      await emitTimes(100, getQuotaBackedOff)

      expect(getQuotaMock).not.toHaveBeenCalled()

      // ramp up to 1% after 1 second

      await rampUp()

      await expectEnabledPercent(1)

      getQuotaMock.mockClear()

      // fail again

      await emitFailures(1)
      emitSpy.mockClear()

      await vi.advanceTimersByTimeAsync(1000)

      expect(emitSpy).toHaveBeenCalledOnce()
      expect(emitSpy).toHaveBeenCalledWith(events.internal.quota.disabled)
    })

    it('should emit quota enabled events when gradually re-enabling requests', async () => {
      randomSpy.mockReturnValue(0.99)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, getQuotaBackedOff)

      // ramp up to 1%

      emitSpy.mockClear()

      await rampUp()

      expect(emitSpy).toHaveBeenLastCalledWith(events.internal.quota.enabled, { enabledPercent: 1 })

      // ramp up to 5%

      await rampUp()

      expect(emitSpy).toHaveBeenLastCalledWith(events.internal.quota.enabled, { enabledPercent: 5 })

      // ramp up to 10%

      await rampUp()

      expect(emitSpy).toHaveBeenLastCalledWith(events.internal.quota.enabled, { enabledPercent: 10 })

      // ramp up to 25%

      await rampUp()

      expect(emitSpy).toHaveBeenLastCalledWith(events.internal.quota.enabled, { enabledPercent: 25 })

      // ramp up to 50%

      await rampUp()

      expect(emitSpy).toHaveBeenLastCalledWith(events.internal.quota.enabled, { enabledPercent: 50 })

      // ramp up to 100%

      await rampUp()

      expect(emitSpy).toHaveBeenLastCalledWith(events.internal.quota.enabled, { enabledPercent: 100 })
    })
  })

  describe('logging', () => {
    let infoSpy = vi.spyOn(logger, 'info')
    let errorSpy = vi.spyOn(logger, 'error')

    beforeEach(() => {
      infoSpy.mockRestore()
      errorSpy.mockRestore()

      infoSpy = vi.spyOn(logger, 'info')
      errorSpy = vi.spyOn(logger, 'error')
    })

    it('should log error if fail rate is over 10%', async () => {
      emitSpy.mockClear()
      await emitSuccesses(89)
      await emitFailures(11)
      emitSpy.mockClear()

      await vi.advanceTimersByTimeAsync(1000)
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy).toHaveBeenCalledWith('Failed to get more than 10% of get quota requests. Failing open')
    })

    it('should log error in case of repetitive failure', async () => {
      randomSpy.mockReturnValue(0.99)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy).toHaveBeenCalledWith('Failed to get more than 10% of get quota requests. Failing open')

      errorSpy.mockClear()

      // ramp up to 1% after 1 second

      await rampUp()

      // fail again

      await emitFailures(1)

      await vi.advanceTimersByTimeAsync(1000)

      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy).toHaveBeenCalledWith('Failed to get more than 10% of get quota requests. Failing open')
    })

    it('should log on info level when gradually re-enabling requests', async () => {
      randomSpy.mockReturnValue(0.99)

      await emitSuccesses(89)
      await emitFailures(11)

      await vi.advanceTimersByTimeAsync(1000)

      await emitTimes(100, getQuotaBackedOff)

      // ramp up to 1%

      await rampUp()

      expect(infoSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledWith('Enabled %d%% of get quota requests', 1)

      infoSpy.mockClear()

      // ramp up to 5%

      await rampUp()

      expect(infoSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledWith('Enabled %d%% of get quota requests', 5)

      infoSpy.mockClear()

      // ramp up to 10%

      await rampUp()

      expect(infoSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledWith('Enabled %d%% of get quota requests', 10)

      infoSpy.mockClear()

      // ramp up to 25%

      await rampUp()

      expect(infoSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledWith('Enabled %d%% of get quota requests', 25)

      infoSpy.mockClear()

      // ramp up to 50%

      await rampUp()

      expect(infoSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledWith('Enabled %d%% of get quota requests', 50)

      infoSpy.mockClear()

      // ramp up to 100%

      await rampUp()

      expect(infoSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledWith('Enabled %d%% of get quota requests', 100)

      infoSpy.mockClear()
    })
  })

  async function rampUp () {
    await emitSuccesses(1)

    await vi.advanceTimersByTimeAsync(1000)
  }

  async function expectEnabledPercent (expectedPercent: number) {
    await emitTimes(expectedPercent, async () => {
      randomSpy.mockReturnValueOnce(expectedPercent / 100)
    })

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(expectedPercent)
  }

  async function expectWholeRampUpCycle () {
    // ramp up to 1%

    await rampUp()

    await expectEnabledPercent(1)

    getQuotaMock.mockClear()

    // ramp up to 5%

    await rampUp()

    await expectEnabledPercent(5)

    getQuotaMock.mockClear()

    // ramp up to 10%

    await rampUp()

    await expectEnabledPercent(10)

    getQuotaMock.mockClear()

    // ramp up to 25%

    await rampUp()

    await expectEnabledPercent(25)

    getQuotaMock.mockClear()

    // ramp up to 50%

    await rampUp()

    await expectEnabledPercent(50)

    getQuotaMock.mockClear()

    // ramp up to 100%

    await rampUp()

    await emitTimes(100, getQuotaBackedOff)

    expect(getQuotaMock).toHaveBeenCalledTimes(100)

    getQuotaMock.mockClear()
  }
})
