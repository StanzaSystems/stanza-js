import { type OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';

export type OTLPExporterFetchConfigBase = Omit<
  OTLPExporterConfigBase,
  'headers'
> & { headers?: Record<string, string> };
