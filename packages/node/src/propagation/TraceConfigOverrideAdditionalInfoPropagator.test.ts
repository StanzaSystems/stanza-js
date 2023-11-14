import {
  getTraceConfigOverrideAdditionalInfo,
  TraceConfigOverrideAdditionalInfoPropagator,
} from './TraceConfigOverrideAdditionalInfoPropagator';
import { beforeEach, vi } from 'vitest';
import {
  type getServiceConfig,
  type ServiceConfigListener,
} from '../global/serviceConfig';
import { type ServiceConfig } from '../hub/model';
import { ROOT_CONTEXT, type TextMapGetter } from '@opentelemetry/api';

const recordGetter: TextMapGetter<Record<string, string>> = {
  get: (carrier, key) => carrier[key],
  keys: (carrier) => Object.keys(carrier),
};

let serviceListener: ServiceConfigListener;

type GetServiceConfig = typeof getServiceConfig;
const getServiceConfigMock = vi.fn<
  Parameters<GetServiceConfig>,
  ReturnType<GetServiceConfig>
>();
vi.mock('../global/serviceConfig', () => {
  return {
    getServiceConfig: ((...args) =>
      getServiceConfigMock(...args)) satisfies GetServiceConfig,
    addServiceConfigListener: (newListener: ServiceConfigListener) => {
      serviceListener = newListener;
    },
  };
});

const mockServiceConfigWithoutOverrides = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
      paramSampleConfig: [],
      headerSampleConfig: [],
    } satisfies ServiceConfig['config']['traceConfig'],
  },
} as unknown as ServiceConfig;

const mockServiceConfigWithOverrides = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [
        {
          spanSelectors: [
            {
              otelAttribute: 'http.server.header.test_header_override',
              value: 'test header override value',
            },
            {
              otelAttribute: 'http.server.header.another_test_header_override',
              value: 'another test header override value',
            },
          ],
          sampleRate: 0.5,
        },
        {
          spanSelectors: [
            {
              otelAttribute: 'http.server.header.test_header_override',
              value: 'test header override value',
            },
            {
              otelAttribute:
                'http.server.header.yet_another_test_header_override',
              value: 'yet-another-test header override value',
            },
          ],
          sampleRate: 0.5,
        },
      ],
      paramSampleConfig: [],
      headerSampleConfig: [],
    } satisfies ServiceConfig['config']['traceConfig'],
  },
} as unknown as ServiceConfig;

const secondMockServiceConfigWithOverrides = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [
        {
          spanSelectors: [
            {
              otelAttribute: 'http.server.header.test_header_override',
              value: 'test header override value',
            },
            {
              otelAttribute: 'http.server.header.another_test_header_override',
              value: 'another test header override value',
            },
          ],
          sampleRate: 0.5,
        },
        {
          spanSelectors: [
            {
              otelAttribute: 'http.server.header.second_test_header_override',
              value: 'test header override value',
            },
            {
              otelAttribute:
                'http.server.header.second_another_test_header_override',
              value: 'another test header override value',
            },
          ],
          sampleRate: 0.5,
        },
        {
          spanSelectors: [
            {
              otelAttribute: 'http.server.header.second_test_header_override',
              value: 'test header override value',
            },
            {
              otelAttribute:
                'http.server.header.second_yet_another_test_header_override',
              value: 'yet-another-test header override value',
            },
          ],
          sampleRate: 0.5,
        },
      ],
      paramSampleConfig: [],
      headerSampleConfig: [],
    } satisfies ServiceConfig['config']['traceConfig'],
  },
} as unknown as ServiceConfig;
beforeEach(async () => {
  getServiceConfigMock.mockReset();
});
describe('TraceConfigOverrideAdditionalInfoPropagator', () => {
  it('should create TraceConfigOverrideAdditionalInfoPropagator', () => {
    expect(
      () => new TraceConfigOverrideAdditionalInfoPropagator(),
    ).not.toThrow();
  });

  describe('extract', () => {
    it('should add empty additional info if carrier is empty', () => {
      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      const newContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter);
      expect(getTraceConfigOverrideAdditionalInfo(newContext)).toEqual({});
    });

    it('should add empty additional info if service config is not initialized', () => {
      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      const newContext = propagator.extract(
        ROOT_CONTEXT,
        {
          'test-header': 'test-value',
        },
        recordGetter,
      );
      expect(getTraceConfigOverrideAdditionalInfo(newContext)).toEqual({});
    });

    it('should return only used headers necessary for trace config overrides if service config is initialized', () => {
      getServiceConfigMock.mockImplementationOnce(
        () => mockServiceConfigWithOverrides,
      );

      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      const newContext = propagator.extract(
        ROOT_CONTEXT,
        {
          'test-header': 'test-value',
          'test-header-override': 'test-value',
          'another-test-header-override': 'another-test-value',
          'yet-another-test-header-override': 'yet-another-test-value',
        },
        recordGetter,
      );
      expect(getTraceConfigOverrideAdditionalInfo(newContext)).toEqual({
        headers: {
          'test-header-override': 'test-value',
          'another-test-header-override': 'another-test-value',
          'yet-another-test-header-override': 'yet-another-test-value',
        },
      });
    });

    it('should return only used headers necessary for trace config overrides after service config is updated', () => {
      getServiceConfigMock.mockImplementationOnce(
        () => mockServiceConfigWithOverrides,
      );

      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      const newContext = propagator.extract(
        ROOT_CONTEXT,
        {
          'test-header': 'test-value',
          'test-header-override': 'test-value',
          'another-test-header-override': 'another-test-value',
          'yet-another-test-header-override': 'yet-another-test-value',
          'second-test-header-override': 'second-test-value',
          'second-another-test-header-override': 'second-another-test-value',
          'second-yet-another-test-header-override':
            'second-yet-another-test-value',
        },
        recordGetter,
      );
      expect(getTraceConfigOverrideAdditionalInfo(newContext)).toEqual({
        headers: {
          'test-header-override': 'test-value',
          'another-test-header-override': 'another-test-value',
          'yet-another-test-header-override': 'yet-another-test-value',
        },
      });

      serviceListener({
        initialized: true,
        data: secondMockServiceConfigWithOverrides,
      });

      const secondContext = propagator.extract(
        ROOT_CONTEXT,
        {
          'test-header': 'test-value',
          'test-header-override': 'test-value',
          'another-test-header-override': 'another-test-value',
          'yet-another-test-header-override': 'yet-another-test-value',
          'second-test-header-override': 'second-test-value',
          'second-another-test-header-override': 'second-another-test-value',
          'second-yet-another-test-header-override':
            'second-yet-another-test-value',
        },
        recordGetter,
      );
      expect(getTraceConfigOverrideAdditionalInfo(secondContext)).toEqual({
        headers: {
          'test-header-override': 'test-value',
          'another-test-header-override': 'another-test-value',
          'second-test-header-override': 'second-test-value',
          'second-another-test-header-override': 'second-another-test-value',
          'second-yet-another-test-header-override':
            'second-yet-another-test-value',
        },
      });
    });

    it('should return headers that are used in trace config overrides that do not exist in carrier', () => {
      getServiceConfigMock.mockImplementationOnce(
        () => mockServiceConfigWithOverrides,
      );

      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      const newContext = propagator.extract(
        ROOT_CONTEXT,
        {
          'test-header': 'test-value',
          'yet-another-test-header-override': 'yet-another-test-value',
        },
        recordGetter,
      );
      expect(getTraceConfigOverrideAdditionalInfo(newContext)).toEqual({
        headers: {
          'yet-another-test-header-override': 'yet-another-test-value',
        },
      });
    });
  });

  describe('fields', () => {
    it('should return empty fields if service is not initialized', () => {
      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      expect(propagator.fields()).toEqual([]);
    });

    it('should return empty fields if service config has no overrides', () => {
      getServiceConfigMock.mockImplementationOnce(
        () => mockServiceConfigWithoutOverrides,
      );

      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      expect(propagator.fields()).toEqual([]);
    });

    it('should return headers that are used in trace config overrides', () => {
      getServiceConfigMock.mockImplementationOnce(
        () => mockServiceConfigWithOverrides,
      );

      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      expect(propagator.fields()).toEqual([
        'test-header-override',
        'another-test-header-override',
        'yet-another-test-header-override',
      ]);
    });

    it('should return headers that are used in trace config overrides after the service config is updated', () => {
      getServiceConfigMock.mockImplementationOnce(
        () => mockServiceConfigWithOverrides,
      );

      const propagator = new TraceConfigOverrideAdditionalInfoPropagator();

      expect(propagator.fields()).toEqual([
        'test-header-override',
        'another-test-header-override',
        'yet-another-test-header-override',
      ]);

      serviceListener({
        initialized: true,
        data: secondMockServiceConfigWithOverrides,
      });

      expect(propagator.fields()).toEqual([
        'test-header-override',
        'another-test-header-override',
        'second-test-header-override',
        'second-another-test-header-override',
        'second-yet-another-test-header-override',
      ]);
    });
  });
});
