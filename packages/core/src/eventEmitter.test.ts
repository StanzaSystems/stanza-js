import { describe, expect, it, vi } from 'vitest'
import Emittery from 'emittery'

describe('eventEmitter', () => {
  it('should dispatch event without any listeners', () => {
    const eventEmitter = new Emittery()

    expect(async () => {
      await eventEmitter.emit('change', 'My change')
    }).not.toThrow()
  })

  it('should listen to a dispatched change event', async () => {
    const eventEmitter = new Emittery()

    const listener = vi.fn()

    eventEmitter.on('change', listener)

    await eventEmitter.emit('change', 'My change')

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith('My change')
  })

  it('should listen to a dispatched change event - multiple listeners', async () => {
    const eventEmitter = new Emittery()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    eventEmitter.on('change', listener1)
    eventEmitter.on('change', listener2)

    await eventEmitter.emit('change', 'My change')

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith('My change')

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith('My change')
  })

  it('should not listen to a dispatched change event after it has been unsubscribed - using unsubscribe returned from addChange', async () => {
    const eventEmitter = new Emittery()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const unsubscribe1 = eventEmitter.on('change', listener1)
    const unsubscribe2 = eventEmitter.on('change', listener2)

    await eventEmitter.emit('change', 'My change')

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith('My change')

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith('My change')

    listener1.mockReset()
    listener2.mockReset()

    unsubscribe1()
    unsubscribe2()

    await eventEmitter.emit('change', 'My change')

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
  })
})
