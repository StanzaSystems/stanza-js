/*
 * Based on: https://github.com/open-telemetry/opentelemetry-js/blob/3e5929132129ed6022adbd05d085b998cb03e3d5/experimental/packages/opentelemetry-exporter-metrics-otlp-http/src/platform/node/OTLPMetricExporter.ts
 * Adjusted to work with OTLPExporterFetchBase
 * */

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  OTLPMetricExporterBase,
  type OTLPMetricExporterOptions,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { type ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import {
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded,
} from '@opentelemetry/otlp-exporter-base';
import {
  createExportMetricsServiceRequest,
  type IExportMetricsServiceRequest,
} from '@opentelemetry/otlp-transformer';
import { type OTLPExporterFetchConfigBase } from './types';
import { OTLPExporterFetchBase } from './OTLPExporterFetchBase';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/metrics';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318/${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

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
      ...baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      ),
      ...config?.headers,
    };
  }

  convert(metrics: ResourceMetrics[]): IExportMetricsServiceRequest {
    return createExportMetricsServiceRequest(metrics, { useLongBits: false });
  }

  getDefaultUrl(config: OTLPExporterFetchConfigBase): string {
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
