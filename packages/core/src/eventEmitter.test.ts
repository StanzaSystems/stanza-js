import { describe, expect, it, vi } from 'vitest'
import { StanzaChangeTarget } from './eventEmitter'

describe('eventEmitter', () => {
  it('should dispatch event without any listeners', () => {
    const eventEmitter = new StanzaChangeTarget<string>()

    expect(() => { eventEmitter.dispatchChange('My change') }).not.toThrow()
  })

  it('should listen to a dispatched change event', () => {
    const eventEmitter = new StanzaChangeTarget<string>()

    const listener = vi.fn()

    eventEmitter.addChangeListener(listener)

    eventEmitter.dispatchChange('My change')

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith('My change')
  })

  it('should listen to a dispatched change event - multiple listeners', () => {
    const eventEmitter = new StanzaChangeTarget<string>()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    eventEmitter.addChangeListener(listener1)
    eventEmitter.addChangeListener(listener2)

    eventEmitter.dispatchChange('My change')

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith('My change')

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith('My change')
  })

  it('should not listen to a dispatched change event after it has been unsubscribed - using unsubscribe returned from addChange', () => {
    const eventEmitter = new StanzaChangeTarget<string>()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const unsubscribe1 = eventEmitter.addChangeListener(listener1)
    const unsubscribe2 = eventEmitter.addChangeListener(listener2)

    eventEmitter.dispatchChange('My change')

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith('My change')

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith('My change')

    listener1.mockReset()
    listener2.mockReset()

    unsubscribe1()

    eventEmitter.dispatchChange('My change 2')

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledOnce()

    listener1.mockReset()
    listener2.mockReset()

    unsubscribe2()

    eventEmitter.dispatchChange('My change 3')

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
  })

  it('should not listen to a dispatched change event after it has been unsubscribed - using removeChangeListener', () => {
    const eventEmitter = new StanzaChangeTarget<string>()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    eventEmitter.addChangeListener(listener1)
    eventEmitter.addChangeListener(listener2)

    eventEmitter.dispatchChange('My change')

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith('My change')

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith('My change')

    listener1.mockReset()
    listener2.mockReset()

    eventEmitter.removeChangeListener(listener1)

    eventEmitter.dispatchChange('My change 2')

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledOnce()

    listener1.mockReset()
    listener2.mockReset()

    eventEmitter.removeChangeListener(listener2)

    eventEmitter.dispatchChange('My change 3')

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
  })
})
