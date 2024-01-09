import { ROOT_CONTEXT } from '@opentelemetry/api';
/* eslint-disable import/no-duplicates */
import type * as SdkTraceNodeModule from '@opentelemetry/sdk-trace-base';
import {
  BatchSpanProcessor,
  InMemorySpanExporter,
  NoopSpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
/* eslint-enable */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addStanzaGuardToContext,
  resetServiceConfig,
  updateServiceConfig,
} from '@getstanza/sdk-base';
import { type ServiceConfig } from '@getstanza/hub-client-api';
import type * as createSpanExporterModule from './createSpanExporter';
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager';

vi.mock('./createSpanExporter', () => {
  return {
    createSpanExporter: (...args) => createSpanExporterMock(...args),
  } satisfies typeof createSpanExporterModule;
});

vi.mock(
  '@opentelemetry/sdk-trace-base',
  async (importOriginal: () => Promise<typeof SdkTraceNodeModule>) => {
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

const createSpanExporterMock = vi.fn(
  (config, _serviceName: string, _serviceRelease: string) => {
    return new CustomSpanExporter(config);
  }
);

class CustomSpanExporter extends InMemorySpanExporter {
  constructor(public readonly config: ServiceConfig['config']['traceConfig']) {
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
      () => new StanzaSpanProcessorManager('TestService', '1.0.0')
    ).not.toThrow();
  });

  describe('empty context', () => {
    it('should return NoopSpanProcessor if service config is not initialized', function () {
      const manager = new StanzaSpanProcessorManager('TestService', '1.0.0');

      expect(manager.getSpanProcessor(ROOT_CONTEXT)).toBeInstanceOf(
        NoopSpanProcessor
      );
    });

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager('TestService', '1.0.0');

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

      const manager = new StanzaSpanProcessorManager('TestService', '1.0.0');

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

      const manager = new StanzaSpanProcessorManager('TestService', '1.0.0');

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
      const manager = new StanzaSpanProcessorManager('TestService', '1.0.0');

      expect(
        manager.getSpanProcessor(
          addStanzaGuardToContext('myGuard')(ROOT_CONTEXT)
        )
      ).toBeInstanceOf(NoopSpanProcessor);
    });

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSpanProcessorManager('TestService', '1.0.0');

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