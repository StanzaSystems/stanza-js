import {
  OTLPMetricExporterBase,
  type OTLPMetricExporterOptions,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { type ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import {
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded,
  type OTLPExporterNodeConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import {
  createExportMetricsServiceRequest,
  type IExportMetricsServiceRequest,
} from '@opentelemetry/otlp-transformer';
import { type OTLPExporterFetchConfigBase } from './types';
import { OTLPExporterFetchBase } from './OTLPExporterFetchBase';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/metrics';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318/${DEFAULT_COLLECTOR_RESOURCE_PATH}`;
const USER_AGENT = {
  // 'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

class OTLPExporterFetchProxy extends OTLPExporterFetchBase<
  ResourceMetrics,
  IExportMetricsServiceRequest
> {
  constructor(
    config?: OTLPExporterFetchConfigBase & OTLPMetricExporterOptions
  ) {
    super(config);
    this.headers = {
      ...this.headers,
      ...USER_AGENT,
      ...baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      ),
      ...config?.headers,
    };
  }

  convert(metrics: ResourceMetrics[]): IExportMetricsServiceRequest {
    return createExportMetricsServiceRequest(metrics, { useLongBits: false });
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase): string {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
      ? appendRootPathToUrlIfNeeded(
          getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
        )
      : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
      ? appendResourcePathToUrl(
          getEnv().OTEL_EXPORTER_OTLP_ENDPOINT,
          DEFAULT_COLLECTOR_RESOURCE_PATH
        )
      : DEFAULT_COLLECTOR_URL;
  }
}

export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPExporterFetchProxy> {
  constructor(
    config?: OTLPExporterFetchConfigBase & OTLPMetricExporterOptions
  ) {
    super(new OTLPExporterFetchProxy(config), config);
  }
}
