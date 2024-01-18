import { ROOT_CONTEXT } from '@opentelemetry/api';
import type * as BatchSpanProcessorModule from './BatchSpanProcessor';
import { BatchSpanProcessor } from './BatchSpanProcessor';
import {
  InMemorySpanExporter,
  NoopSpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ServiceConfig } from '@getstanza/hub-client-api';
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager';
import {
  resetServiceConfig,
  updateServiceConfig,
} from '../../global/serviceConfig';
import { addStanzaGuardToContext } from '../../context/guard';

vi.mock(
  './BatchSpanProcessor',
  async (importOriginal: () => Promise<typeof BatchSpanProcessorModule>) => {
    const original = await importOriginal();

    class MockSpanProcessor
      extends original.BatchSpanProcessor
      implements CustomSpanProcessor
    {
      constructor(public exporter: SpanExporter) {
        super(exporter);
      }
    }

    return {
      ...original,
      BatchSpanProcessor: MockSpanProcessor,
    };
  }
);

const createSpanExporterMock = vi.fn((config: { collectorUrl: string }) => {
  return new CustomSpanExporter(config);
});

class CustomSpanExporter extends InMemorySpanExporter {
  constructor(
    public readonly config: {
      collectorUrl: string;
    } & Record<string, unknown>
  ) {
    super();
  }
}

type CustomSpanProcessor = BatchSpanProcessor & { exporter: SpanExporter };

const mockServiceConfig: ServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: [],
    },
    metricConfig: {
      collectorUrl: 'https://test.collector',
    },
    sentinelConfig: {
      circuitbreakerRulesJson: 'circuitbreakerRulesJson',
      flowRulesJson: 'flowRulesJson',
      isolationRulesJson: 'isolationRulesJson',
      systemRulesJson: 'systemRulesJson',
    },
  },
};

const secondMockServiceConfig: ServiceConfig = {
  version: 'test2',
  config: {
    traceConfig: {
      collectorUrl: 'https://test2.collector',
      sampleRateDefault: 0.9,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: [],
    },
    metricConfig: {
      collectorUrl: 'https://test2.collector',
    },
    sentinelConfig: {
      circuitbreakerRulesJson: 'circuitbreakerRulesJson',
      flowRulesJson: 'flowRulesJson',
      isolationRulesJson: 'isolationRulesJson',
      systemRulesJson: 'systemRulesJson',
    },
  },
};

beforeEach(async () => {
  resetServiceConfig();
});
describe('StanzaSpanProcessorManager', function () {
  it('should create StanzaSpanProcessorManager', function () {
    expect(
      () => new StanzaSpanProcessorManager(createSpanExporterMock)
    ).not.toThrow();
  });

  describe('empty context', () => {
    it('should return NoopSpanProcessor if service config is not initialized', function () {
      const manager = new StanzaSpanProcessorManager(createSpanExporterMock);

      expect(manager.getSpanProcessor(ROOT_CONTEXT)).toBeInstanceOf(
        NoopSpanProcessor
      );
    });

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager(createSpanExporterMock);

      updateServiceConfig(mockServiceConfig);

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT);
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor);
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual(
        new CustomSpanExporter({
          collectorUrl: 'https://test.collector',
          sampleRateDefault: 1,
          overrides: [],
          headerSampleConfig: [],
          paramSampleConfig: [],
        })
      );
    });

    it('should return service processor if service config is initialized before creating the manager', function () {
      updateServiceConfig(mockServiceConfig);

      const manager = new StanzaSpanProcessorManager(createSpanExporterMock);

      const spanProcessor = manager.getSpanProcessor(ROOT_CONTEXT);
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor);
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual(
        new CustomSpanExporter({
          collectorUrl: 'https://test.collector',
          sampleRateDefault: 1,
          overrides: [],
          headerSampleConfig: [],
          paramSampleConfig: [],
        })
      );
    });

    it('should return updated service processor after service config is updated', function () {
      updateServiceConfig(mockServiceConfig);

      const manager = new StanzaSpanProcessorManager(createSpanExporterMock);

      const spanProcessor1 = manager.getSpanProcessor(ROOT_CONTEXT);
      expect(spanProcessor1).toBeInstanceOf(BatchSpanProcessor);
      expect((spanProcessor1 as CustomSpanProcessor).exporter).toEqual(
        new CustomSpanExporter({
          collectorUrl: 'https://test.collector',
          sampleRateDefault: 1,
          overrides: [],
          headerSampleConfig: [],
          paramSampleConfig: [],
        })
      );

      updateServiceConfig(secondMockServiceConfig);

      const spanProcessor2 = manager.getSpanProcessor(ROOT_CONTEXT);
      expect(spanProcessor2).toBeInstanceOf(BatchSpanProcessor);
      expect((spanProcessor2 as CustomSpanProcessor).exporter).toEqual(
        new CustomSpanExporter({
          collectorUrl: 'https://test2.collector',
          sampleRateDefault: 0.9,
          overrides: [],
          headerSampleConfig: [],
          paramSampleConfig: [],
        })
      );
    });
  });

  describe('context with guard', () => {
    it('should return NoopSpanProcessor if service config is not initialized', function () {
      const manager = new StanzaSpanProcessorManager(createSpanExporterMock);

      expect(
        manager.getSpanProcessor(
          addStanzaGuardToContext('myGuard')(ROOT_CONTEXT)
        )
      ).toBeInstanceOf(NoopSpanProcessor);
    });

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager(createSpanExporterMock);

      updateServiceConfig(mockServiceConfig);

      const spanProcessor = manager.getSpanProcessor(
        addStanzaGuardToContext('myGuard')(ROOT_CONTEXT)
      );
      expect(spanProcessor).toBeInstanceOf(BatchSpanProcessor);
      expect((spanProcessor as CustomSpanProcessor).exporter).toEqual(
        new CustomSpanExporter({
          collectorUrl: 'https://test.collector',
          sampleRateDefault: 1,
          overrides: [],
          headerSampleConfig: [],
          paramSampleConfig: [],
        })
      );
    });
  });
});
