import { ROOT_CONTEXT } from '@opentelemetry/api'
import { AlwaysOffSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaDecoratorContextKey } from '../../context/stanzaDecoratorContextKey'
import { type DecoratorConfigListener, type getDecoratorConfig } from '../../global/decoratorConfig'
import { type getServiceConfig, type ServiceConfigListener } from '../../global/serviceConfig'
import { type DecoratorConfig, type ServiceConfig } from '../../hub/model'
import { StanzaSamplerManager } from './StanzaSamplerManager'

let serviceListener: ServiceConfigListener
let decoratorListener: DecoratorConfigListener

type GetServiceConfig = typeof getServiceConfig
type GetDecoratorConfig = typeof getDecoratorConfig
const getServiceConfigMock = vi.fn<Parameters<GetServiceConfig>, ReturnType<GetServiceConfig>>()
const getDecoratorConfigMock = vi.fn<Parameters<GetDecoratorConfig>, ReturnType<GetDecoratorConfig>>()
vi.mock('../../global/serviceConfig', () => {
  return {
    getServiceConfig: ((...args) => getServiceConfigMock(...args)) satisfies GetServiceConfig,
    addServiceConfigListener: (newListener: ServiceConfigListener) => {
      serviceListener = newListener
    }
  }
})
vi.mock('../../global/decoratorConfig', async (importOriginal) => {
  const original: any = await importOriginal()

  return {
    ...original,
    getDecoratorConfig: ((...args) => getDecoratorConfigMock(...args)) satisfies GetDecoratorConfig,
    addDecoratorConfigListener: (_decoratorName: string, newListener: DecoratorConfigListener) => {
      decoratorListener = newListener
    }
  }
})

const mockServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: []
    }
  }
} as unknown as ServiceConfig

const secondMockServiceConfig = {
  version: 'test2',
  config: {
    traceConfig: {
      collectorUrl: 'https://test2.collector',
      sampleRateDefault: 0.9,
      overrides: []
    }
  }
} as unknown as ServiceConfig

const mockDecoratorConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.decorator.collector',
      sampleRateDefault: 0.1,
      overrides: []
    }
  }
} as unknown as DecoratorConfig

beforeEach(async () => {
  getServiceConfigMock.mockReset()
  getDecoratorConfigMock.mockReset()
})

describe('StanzaSamplerManager', function () {
  it('should create StanzaSamplerManager', function () {
    expect(() => new StanzaSamplerManager()).not.toThrow()
  })

  describe('empty context', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager()

      expect(manager.getSampler(ROOT_CONTEXT)).toBeInstanceOf(AlwaysOffSampler)
    })

    it('should return service sampler if service config is initialized', function () {
      const manager = new StanzaSamplerManager()

      serviceListener(mockServiceConfig)

      const sampler = manager.getSampler(ROOT_CONTEXT)
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(1))
    })

    it('should return service sampler if service config is initialized before creating the manager', function () {
      getServiceConfigMock.mockImplementationOnce(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const sampler = manager.getSampler(ROOT_CONTEXT)
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(1))
    })

    it('should return updated service sampler after service config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const sampler1 = manager.getSampler(ROOT_CONTEXT)
      expect(sampler1).toEqual(new TraceIdRatioBasedSampler(1))

      serviceListener(secondMockServiceConfig)

      const sampler2 = manager.getSampler(ROOT_CONTEXT)
      expect(sampler2).toEqual(new TraceIdRatioBasedSampler(0.9))
    })
  })

  describe('context with decorator', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager()

      expect(manager.getSampler(ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator'))).toBeInstanceOf(AlwaysOffSampler)
    })

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSamplerManager()

      serviceListener(mockServiceConfig)

      const sampler = manager.getSampler(ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator'))
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(1))
    })

    it('should return decorator processor if decorator config is initialized', function () {
      getServiceConfigMock.mockImplementationOnce(() => mockServiceConfig)

      getDecoratorConfigMock.mockImplementationOnce(() => mockDecoratorConfig)

      const manager = new StanzaSamplerManager()

      const sampler = manager.getSampler(ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator'))
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(0.1))
    })

    it('should return decorator processor after decorator config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const contextWithDecorator = ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator')
      const sampler1 = manager.getSampler(contextWithDecorator)
      expect(sampler1).toEqual(new TraceIdRatioBasedSampler(1))

      decoratorListener(mockDecoratorConfig)

      const sampler2 = manager.getSampler(contextWithDecorator)
      expect(sampler2).toEqual(new TraceIdRatioBasedSampler(0.1))
    })

    it('should return decorator processor after service config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)
      getDecoratorConfigMock.mockImplementation(() => mockDecoratorConfig)

      const manager = new StanzaSamplerManager()

      const contextWithDecorator = ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator')

      const sampler1 = manager.getSampler(contextWithDecorator)
      expect(sampler1).toEqual(new TraceIdRatioBasedSampler(0.1))

      serviceListener(secondMockServiceConfig)

      const sampler2 = manager.getSampler(contextWithDecorator)
      expect(sampler2).toEqual(new TraceIdRatioBasedSampler(0.1))
    })
  })
})
