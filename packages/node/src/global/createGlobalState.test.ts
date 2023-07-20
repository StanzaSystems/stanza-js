import { createGlobalState } from './createGlobalState'
import { expect, vi } from 'vitest'

describe('createGlobalState', () => {
  it('should create a global state', () => {
    const state = createGlobalState(Symbol('test symbol'), () => 'test value')

    expect(state.currentValue).toBe('test value')
    expect(typeof state.update).toBe('function')
    expect(typeof state.onChange).toBe('function')
  })

  it('should update the global state', () => {
    const state = createGlobalState(Symbol('test symbol'), () => 'test value')

    expect(state.currentValue).toBe('test value')

    expect(state.update('another value')).toBe('another value')

    expect(state.currentValue).toBe('another value')
  })

  it('should notify listeners of changes', () => {
    const state = createGlobalState(Symbol('test symbol'), () => 'test value')

    const listener = vi.fn()

    state.onChange(listener)

    state.update('another value')

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith('another value')
  })

  it('should NOT notify listeners of changes after they are unsubscribed', () => {
    const state = createGlobalState(Symbol('test symbol'), () => 'test value')

    const listener = vi.fn()

    const unsubscribeListener = state.onChange(listener)

    state.update('another value')

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith('another value')

    listener.mockReset()

    unsubscribeListener()

    state.update('another value')

    expect(listener).not.toHaveBeenCalled()
  })

  it('should use existing value if global state already exists', () => {
    const testSymbol = Symbol('test symbol')
    const firstState = createGlobalState(testSymbol, () => 'test value')

    firstState.update('another value')

    const secondState = createGlobalState(testSymbol, () => 'test value')

    expect(secondState.currentValue).toBe('another value')
  })

  it('should keep global states for the same symbol in sync', () => {
    const testSymbol = Symbol('test symbol')
    const firstState = createGlobalState(testSymbol, () => 'test value')
    const secondState = createGlobalState(testSymbol, () => 'test value')

    firstState.update('another value')

    expect(firstState.currentValue).toBe('another value')
    expect(secondState.currentValue).toBe('another value')
  })

  it('should return the same state instance for same symbol', () => {
    const testSymbol = Symbol('test symbol')
    const firstState = createGlobalState(testSymbol, () => 'test value')
    const secondState = createGlobalState(testSymbol, () => 'test value')

    expect(firstState).toBe(secondState)
  })
})
