import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTraceConfig } from './getTraceConfig';
import { type ServiceConfig } from '@getstanza/hub-client-api';

type TraceConfig = ReturnType<typeof getTraceConfig>;

vi.mock('./serviceConfig', () => {
  return {
    getServiceConfig: () => getServiceConfigMock(),
  };
});

const getServiceConfigMock = vi.fn();

beforeEach(() => {
  getServiceConfigMock.mockReset();
});

describe('getTraceConfig', function () {
  it('should get empty trace config when it is not available yet', function () {
    expect(getTraceConfig()).toEqual({
      sampleRateDefault: 0,
      collectorUrl: '',
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: [],
    } satisfies TraceConfig);
  });

  it('should get empty trace config when it is not available yet', function () {
    getServiceConfigMock.mockImplementation(() => {
      return {
        config: {
          traceConfig: {
            collectorUrl: 'https://test.collector',
            sampleRateDefault: 0.05,
            overrides: [],
            headerSampleConfig: [],
            paramSampleConfig: [],
          },
          ...({} as any),
        },
        version: '1',
      } satisfies ServiceConfig;
    });

    expect(getTraceConfig()).toEqual({
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 0.05,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: [],
    } satisfies TraceConfig);
  });
});
