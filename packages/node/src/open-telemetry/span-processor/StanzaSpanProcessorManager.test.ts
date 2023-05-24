import { ROOT_CONTEXT } from '@opentelemetry/api'
/* eslint-disable import/no-duplicates */
import type * as SdkTraceNodeModule from '@opentelemetry/sdk-trace-node'
import { BatchSpanProcessor, InMemorySpanExporter, NoopSpanProcessor, type SpanExporter } from '@opentelemetry/sdk-trace-node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaDecoratorContextKey } from '../../context/stanzaDecoratorContextKey'
import { type DecoratorConfigListener, type getDecoratorConfig } from '../../global/decoratorConfig'
import { type getServiceConfig, type ServiceConfigListener } from '../../global/serviceConfig'
import { type DecoratorConfig, type ServiceConfig } from '../../hub/model'
import type * as createSpanExporterModule from './createSpanExporter'
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager'

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

vi.mock('./createSpanExporter', () => {
  return {
    createSpanExporter: (...args) => createSpanExporterMock(...args)
  } satisfies typeof createSpanExporterModule
})

vi.mock('@opentelemetry/sdk-trace-node', async (importOriginal: () => Promise<typeof SdkTraceNodeModule>) => {
  const original = await importOriginal()

  class MockSpanProcessor extends original.BatchSpanProcessor implements CustomSpanProcessor {
    constructor (public exporter: SpanExporter) {
      super(exporter)
    }
  }

  return {
    ...original,
    BatchSpanProcessor: MockSpanProcessor
  }
})

const createSpanExporterMock = vi.fn((config) => {
  return new CustomSpanExporter(config)
})

class CustomSpanExporter extends InMemorySpanExporter {
  constructor (public readonly config: ServiceConfig['config']['traceConfig'] | DecoratorConfig['config']['traceConfig']) {
    super()
  }
}

type CustomSpanProcessor = BatchSpanProcessor & { exporter: SpanExporter }

const mockServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: []
    }
  }
} as unknown as ServiceConfig

const secondMockServiceConfig = {
  version: 'test2',
  config: {
    traceConfig: {
      collectorUrl: 'https://test2.collector',
      sampleRateDefault: 0.9,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: []
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
describe('StanzaSpanProcessorManager', function () {
  it('should create StanzaSpanProcessorManager', function () {
    expect(() => new StanzaSpanProcessorManager()).not.toThrow()
  })

  describe('empty context', () => {
    it('should return NoopSpanProcessor if service config is not initialized', function () {
      const manager = new StanzaSpanProcessorManager()

      expect(manager.getSpanProcessor(ROOT_CONTEXT)).toBeInstanceOf(NoopSpanProcessor)
    })

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager()

      serviceListener(mockServiceConfig)

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT)
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.collector',
        sampleRateDefault: 1,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))
    })

    it('should return service processor if service config is initialized before creating the manager', function () {
      getServiceConfigMock.mockImplementationOnce(() => mockServiceConfig)

      const manager = new StanzaSpanProcessorManager()

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT)
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.collector',
        sampleRateDefault: 1,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))
    })

    it('should return updated service processor after service config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)

      const manager = new StanzaSpanProcessorManager()

      const spanProcessor1 = manager.getSpanProcessor(ROOT_CONTEXT)
      expect(spanProcessor1).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor1 as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.collector',
        sampleRateDefault: 1,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))

      serviceListener(secondMockServiceConfig)

      const spanProcessor2 = manager.getSpanProcessor(ROOT_CONTEXT)
      expect(spanProcessor2).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor2 as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test2.collector',
        sampleRateDefault: 0.9,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))
    })
  })

  describe('context with decorator', () => {
    it('should return NoopSpanProcessor if service config is not initialized', function () {
      const manager = new StanzaSpanProcessorManager()

      expect(manager.getSpanProcessor(ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator'))).toBeInstanceOf(NoopSpanProcessor)
    })

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager()

      serviceListener(mockServiceConfig)

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator'))
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.collector',
        sampleRateDefault: 1,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))
    })

    it('should return decorator processor if decorator config is initialized', function () {
      getServiceConfigMock.mockImplementationOnce(() => mockServiceConfig)

      getDecoratorConfigMock.mockImplementationOnce(() => mockDecoratorConfig)

      const manager = new StanzaSpanProcessorManager()

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator'))
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.decorator.collector',
        sampleRateDefault: 0.1,
        overrides: []
      })))
    })

    it('should return decorator processor after decorator config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)

      const manager = new StanzaSpanProcessorManager()

      const contextWithDecorator = ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator')
      const spanProcessor1 = manager.getSpanProcessor(contextWithDecorator)
      expect(spanProcessor1).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor1 as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.collector',
        sampleRateDefault: 1,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))

      decoratorListener(mockDecoratorConfig)

      const spanProcessor2 = manager.getSpanProcessor(contextWithDecorator)
      expect(spanProcessor2).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor2 as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.decorator.collector',
        sampleRateDefault: 0.1,
        overrides: []
      })))
    })

    it('should return decorator processor after service config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)
      getDecoratorConfigMock.mockImplementation(() => mockDecoratorConfig)

      const manager = new StanzaSpanProcessorManager()

      const contextWithDecorator = ROOT_CONTEXT.setValue(stanzaDecoratorContextKey, 'myDecorator')

      const spanProcessor1 = manager.getSpanProcessor(contextWithDecorator)
      expect(spanProcessor1).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor1 as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.decorator.collector',
        sampleRateDefault: 0.1,
        overrides: []
      })))

      serviceListener(secondMockServiceConfig)

      const spanProcessor2 = manager.getSpanProcessor(contextWithDecorator)
      expect(spanProcessor2).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor2 as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.decorator.collector',
        sampleRateDefault: 0.1,
        overrides: []
      })))
    })
  })
})
