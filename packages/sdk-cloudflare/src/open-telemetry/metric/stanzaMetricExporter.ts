import {
  AggregationTemporality,
  InMemoryMetricExporter,
  type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import {
  addAuthTokenListener,
  addServiceConfigListener,
  eventBus,
  events,
  getServiceConfig,
  getStanzaAuthToken,
  hubService,
  logger,
} from '@getstanza/sdk-base';
import { type ServiceConfig } from '@getstanza/hub-client-api';
import { type ExportResult, ExportResultCode } from '@opentelemetry/core';
import { createUserAgentHeader } from '@getstanza/sdk-utils';
import { OTLPMetricExporter } from '../../otlp-exporter/OTLPMetricExporter';
import { sdkOptions } from '../../sdkOptions';
import { isTokenInvalidError } from '../isTokenInvalidError';

export class StanzaMetricExporter implements PushMetricExporter {
  private exporter: InMemoryMetricExporter | OTLPMetricExporter =
    new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);

  private collectorUrl = '';
  constructor(
    private readonly serviceName: string,
    private readonly serviceRelease: string
  ) {
    let serviceConfig = getServiceConfig();
    let authToken = getStanzaAuthToken();
    if (serviceConfig !== undefined && authToken !== undefined) {
      this.updateExporter(serviceConfig, authToken);
    }
    addServiceConfigListener((state) => {
      serviceConfig = state.initialized ? state.data : undefined;
      if (serviceConfig !== undefined && authToken !== undefined) {
        this.updateExporter(serviceConfig, authToken);
      }
    });
    addAuthTokenListener((newToken) => {
      authToken = newToken;
      if (serviceConfig !== undefined && authToken !== undefined) {
        this.updateExporter(serviceConfig, authToken);
      }
    });
  }

  private updateExporter(
    { config: { metricConfig } }: ServiceConfig,
    authToken: string
  ) {
    const headers = {
      Authorization: `bearer ${authToken}`,
      'User-Agent': createUserAgentHeader({
        ...sdkOptions,
        serviceName: this.serviceName,
        serviceRelease: this.serviceRelease,
      }),
    };
    const prevExporter = this.exporter;
    this.exporter = new OTLPMetricExporter({
      url: metricConfig.collectorUrl,
      headers,
    });
    this.collectorUrl = metricConfig.collectorUrl;
    prevExporter.shutdown().catch((err) => {
      logger.warn('Failed to shutdown a metric exporter: %o', err);
    });
  }

  export(
    ...[metrics, originalCallback, ...restArgs]: Parameters<
      PushMetricExporter['export']
    >
  ): void {
    const oTelAddress = this.collectorUrl;

    logger.debug('exporting metrics to %s', oTelAddress);
    const callback = (result: ExportResult): void => {
      if (
        result.code === ExportResultCode.FAILED &&
        isTokenInvalidError(result.error)
      ) {
        eventBus.emit(events.auth.tokenInvalid).catch(() => {});
      }
      if (result.code === ExportResultCode.SUCCESS) {
        logger.debug('exporting metrics succeeded');
        eventBus
          .emit(events.telemetry.sendOk, {
            ...hubService.getServiceMetadata(),
            oTelAddress,
          })
          .catch(() => {});
      } else {
        logger.debug('exporting metrics failed with error: %o', result.error);
        eventBus
          .emit(events.telemetry.sendFailed, {
            ...hubService.getServiceMetadata(),
            oTelAddress,
          })
          .catch(() => {});
      }
      originalCallback(result);
    };

    this.exporter.export(metrics, callback, ...restArgs);
  }

  async forceFlush(
    ...args: Parameters<PushMetricExporter['forceFlush']>
  ): Promise<void> {
    return this.exporter.forceFlush(...args);
  }

  selectAggregationTemporality(
    ...args: Parameters<
      NonNullable<PushMetricExporter['selectAggregationTemporality']>
    >
  ): AggregationTemporality {
    return this.exporter.selectAggregationTemporality(...args);
  }

  async shutdown(): Promise<void> {
    return this.exporter.shutdown();
  }
}
