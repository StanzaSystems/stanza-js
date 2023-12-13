import { type ServiceConfig } from '@getstanza/hub-client-api';
import { getServiceConfig } from './serviceConfig';

type TraceConfig = ServiceConfig['config']['traceConfig'];
export const getTraceConfig = (): TraceConfig => {
  return (
    getServiceConfig()?.config?.traceConfig ?? {
      collectorUrl: '',
      sampleRateDefault: 0,
      overrides: [],
      headerSampleConfig: [],
      paramSampleConfig: [],
    }
  );
};
