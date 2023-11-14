import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type GuardConfig } from '../hub/model'
import type * as guardConfigModuleImport from './guardConfig'
type GuardConfigModule = typeof guardConfigModuleImport

const STANZA_GUARD_CONFIG_SYMBOL = Symbol.for('Guard Config')
const STANZA_GUARD_CONFIG_LISTENERS_SYMBOL = Symbol.for(
  'Guard Config Listeners'
)
describe('guardConfig', function () {
  let guardConfigModule: GuardConfigModule

  beforeEach(async () => {
    ;(global as any)[STANZA_GUARD_CONFIG_SYMBOL] = undefined
    ;(global as any)[STANZA_GUARD_CONFIG_LISTENERS_SYMBOL] = undefined
    vi.resetModules()
    guardConfigModule = await import('./guardConfig')
  })
  it('should return undefined initially', function () {
    const guardConfig = guardConfigModule.getGuardConfig('testGuard')
    expect(guardConfig).toBeUndefined()
  })

  it('should return updated guard config', function () {
    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('testGuard', updatedConfig)

    expect(guardConfigModule.getGuardConfig('testGuard')).toBe(updatedConfig)
  })

  it('should notify about updated guard', function () {
    const listener = vi.fn()

    guardConfigModule.addGuardConfigListener('testGuard', listener)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('testGuard', updatedConfig)

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith(updatedConfig)
  })

  it('should NOT notify about different updated guard', function () {
    const listener = vi.fn()

    guardConfigModule.addGuardConfigListener('testGuard', listener)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('anotherTestGuard', updatedConfig)

    expect(listener).not.toHaveBeenCalled()
  })

  it('should notify all listeners about updated guard', function () {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    guardConfigModule.addGuardConfigListener('testGuard', listener1)
    guardConfigModule.addGuardConfigListener('testGuard', listener2)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('testGuard', updatedConfig)

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith(updatedConfig)

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith(updatedConfig)
  })

  it('should notify only listeners for a given guard about updated guard', function () {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()
    const listener4 = vi.fn()

    guardConfigModule.addGuardConfigListener('testGuard', listener1)
    guardConfigModule.addGuardConfigListener('testGuard', listener2)
    guardConfigModule.addGuardConfigListener('anotherTestGuard', listener3)
    guardConfigModule.addGuardConfigListener('yetAnotherTestGuard', listener3)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('testGuard', updatedConfig)

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith(updatedConfig)

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith(updatedConfig)

    expect(listener3).not.toHaveBeenCalled()
    expect(listener4).not.toHaveBeenCalled()
  })

  it('should stop notifying after listener unsubscribes', function () {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const unsubscribe1 = guardConfigModule.addGuardConfigListener(
      'testGuard',
      listener1
    )
    guardConfigModule.addGuardConfigListener('testGuard', listener2)

    const updatedConfig1 = {
      version: 'test',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('testGuard', updatedConfig1)

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith(updatedConfig1)

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith(updatedConfig1)

    listener1.mockClear()
    listener2.mockClear()

    unsubscribe1()

    const updatedConfig2 = {
      version: 'test2',
      config: {}
    } as unknown as GuardConfig
    guardConfigModule.updateGuardConfig('testGuard', updatedConfig2)

    expect(listener1).not.toHaveBeenCalled()

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith(updatedConfig2)
  })

  it('should not fail when unsubscribing a listener multiple times', function () {
    const listener = vi.fn()

    const unsubscribe = guardConfigModule.addGuardConfigListener(
      'testGuard',
      listener
    )

    expect(unsubscribe).not.toThrow()
    expect(unsubscribe).not.toThrow()
  })
})
