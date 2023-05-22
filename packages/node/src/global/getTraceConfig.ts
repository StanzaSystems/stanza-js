import { type ServiceConfig } from '../hub/model'
import { getServiceConfig } from './serviceConfig'

type TraceConfig = ServiceConfig['config']['traceConfig']
export const getTraceConfig = (): TraceConfig => {
  return getServiceConfig()?.config?.traceConfig ?? {
    collectorKey: '',
    collectorUrl: '',
    sampleRateDefault: 0,
    overrides: []
  }
}
