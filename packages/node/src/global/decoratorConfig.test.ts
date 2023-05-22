import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type DecoratorConfig } from '../hub/model'
import type * as decoratorConfigModuleImport from './decoratorConfig'
type DecoratorConfigModule = typeof decoratorConfigModuleImport

const STANZA_DECORATOR_CONFIG_SYMBOL = Symbol.for('Decorator Config')
const STANZA_DECORATOR_CONFIG_LISTENERS_SYMBOL = Symbol.for('Decorator Config Listeners')
describe('decoratorConfig', function () {
  let decoratorConfigModule: DecoratorConfigModule

  beforeEach(async () => {
    (global as any)[STANZA_DECORATOR_CONFIG_SYMBOL] = undefined;
    (global as any)[STANZA_DECORATOR_CONFIG_LISTENERS_SYMBOL] = undefined
    vi.resetModules()
    decoratorConfigModule = await import('./decoratorConfig')
  })
  it('should return undefined initially', function () {
    const decoratorConfig = decoratorConfigModule.getDecoratorConfig('testDecorator')
    expect(decoratorConfig).toBeUndefined()
  })

  it('should return updated decorator config', function () {
    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('testDecorator', updatedConfig)

    expect(decoratorConfigModule.getDecoratorConfig('testDecorator')).toBe(updatedConfig)
  })

  it('should notify about updated decorator', function () {
    const listener = vi.fn()

    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('testDecorator', updatedConfig)

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith(updatedConfig)
  })

  it('should NOT notify about different updated decorator', function () {
    const listener = vi.fn()

    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('anotherTestDecorator', updatedConfig)

    expect(listener).not.toHaveBeenCalled()
  })

  it('should notify all listeners about updated decorator', function () {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener1)
    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener2)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('testDecorator', updatedConfig)

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener1).toHaveBeenCalledWith(updatedConfig)

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith(updatedConfig)
  })

  it('should notify only listeners for a given decorator about updated decorator', function () {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()
    const listener4 = vi.fn()

    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener1)
    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener2)
    decoratorConfigModule.addDecoratorConfigListener('anotherTestDecorator', listener3)
    decoratorConfigModule.addDecoratorConfigListener('yetAnotherTestDecorator', listener3)

    const updatedConfig = {
      version: 'test',
      config: {}
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('testDecorator', updatedConfig)

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

    const unsubscribe1 = decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener1)
    decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener2)

    const updatedConfig1 = {
      version: 'test',
      config: {}
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('testDecorator', updatedConfig1)

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
    } as unknown as DecoratorConfig
    decoratorConfigModule.updateDecoratorConfig('testDecorator', updatedConfig2)

    expect(listener1).not.toHaveBeenCalled()

    expect(listener2).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledWith(updatedConfig2)
  })

  it('should not fail when unsubscribing a listener multiple times', function () {
    const listener = vi.fn()

    const unsubscribe = decoratorConfigModule.addDecoratorConfigListener('testDecorator', listener)

    expect(unsubscribe).not.toThrow()
    expect(unsubscribe).not.toThrow()
  })
})
