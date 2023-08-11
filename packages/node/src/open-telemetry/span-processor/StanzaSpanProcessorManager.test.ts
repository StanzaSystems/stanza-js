import { ROOT_CONTEXT } from '@opentelemetry/api'
/* eslint-disable import/no-duplicates */
import type * as SdkTraceNodeModule from '@opentelemetry/sdk-trace-node'
import {
  BatchSpanProcessor,
  InMemorySpanExporter,
  NoopSpanProcessor,
  type SpanExporter
} from '@opentelemetry/sdk-trace-node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaGuardContextKey } from '../../context/stanzaGuardContextKey'
import { type getGuardConfig } from '../../global/guardConfig'
import { type getServiceConfig, type ServiceConfigListener } from '../../global/serviceConfig'
import { type ServiceConfig } from '../../hub/model'
import type * as createSpanExporterModule from './createSpanExporter'
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager'

let serviceListener: ServiceConfigListener

type GetServiceConfig = typeof getServiceConfig
type GetDecoratorConfig = typeof getGuardConfig
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
  constructor (public readonly config: ServiceConfig['config']['traceConfig']) {
    super()
  }
}

type CustomSpanProcessor = BatchSpanProcessor & { exporter: SpanExporter }

const mockServiceConfig: ServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: []
    },
    metricConfig: {
      collectorUrl: 'https://test.collector'
    },
    sentinelConfig: {
      circuitbreakerRulesJson: 'circuitbreakerRulesJson',
      flowRulesJson: 'flowRulesJson',
      isolationRulesJson: 'isolationRulesJson',
      systemRulesJson: 'systemRulesJson'
    }
  }
}

const secondMockServiceConfig: ServiceConfig = {
  version: 'test2',
  config: {
    traceConfig: {
      collectorUrl: 'https://test2.collector',
      sampleRateDefault: 0.9,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: []
    },
    metricConfig: {
      collectorUrl: 'https://test2.collector'
    },
    sentinelConfig: {
      circuitbreakerRulesJson: 'circuitbreakerRulesJson',
      flowRulesJson: 'flowRulesJson',
      isolationRulesJson: 'isolationRulesJson',
      systemRulesJson: 'systemRulesJson'
    }
  }
}

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

      expect(manager.getSpanProcessor(ROOT_CONTEXT.setValue(stanzaGuardContextKey, 'myDecorator'))).toBeInstanceOf(NoopSpanProcessor)
    })

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager()

      serviceListener(mockServiceConfig)

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT.setValue(stanzaGuardContextKey, 'myDecorator'))
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor)
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual((new CustomSpanExporter({
        collectorUrl: 'https://test.collector',
        sampleRateDefault: 1,
        overrides: [],
        headerSampleConfig: [],
        paramSampleConfig: []
      })))
    })
  })
})
