import {
  addAuthTokenListener,
  eventBus,
  events,
  getStanzaAuthToken,
  hubService,
  isTruthy,
  logger,
} from '@getstanza/sdk-base';
import { createUserAgentHeader } from '@getstanza/sdk-utils';
import { OTLPTraceExporter } from '../otlp-exporter/OTLPTraceExporter';
import { sdkOptions } from '../sdkOptions';
import {
  type ReadableSpan,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { type ExportResult, ExportResultCode } from '@opentelemetry/core';
import { isTokenInvalidError } from './isTokenInvalidError';

export class StanzaSpanExporter implements SpanExporter {
  private readonly exporter: OTLPTraceExporter;

  constructor(
    traceConfig: { collectorUrl: string },
    private readonly serviceName: string,
    private readonly serviceRelease: string
  ) {
    this.exporter = new OTLPTraceExporter({
      url: traceConfig.collectorUrl,
      headers: {
        'User-Agent': createUserAgentHeader({
          ...sdkOptions,
          serviceName: this.serviceName,
          serviceRelease: this.serviceRelease,
        }),
      },
    });
    this.updateExporter(getStanzaAuthToken());
    addAuthTokenListener((newToken) => {
      this.updateExporter(newToken);
    });
  }

  private updateExporter(authToken: string | undefined) {
    if (isTruthy(authToken)) {
      this.exporter.headers.Authorization = `bearer ${authToken}`;
    } else {
      delete this.exporter.headers.Authorization;
    }
  }

  export(
    spans: ReadableSpan[],
    originalCallback: (result: ExportResult) => void
  ): void {
    const oTelAddress = this.exporter.url;

    logger.debug('exporting spans to %s', oTelAddress);
    const callback = (result: ExportResult): void => {
      if (
        result.code === ExportResultCode.FAILED &&
        isTokenInvalidError(result.error)
      ) {
        eventBus.emit(events.auth.tokenInvalid).catch(() => {});
      }
      const { serviceName, environment, clientId } =
        hubService.getServiceMetadata();
      if (result.code === ExportResultCode.SUCCESS) {
        logger.debug('exporting spans succeeded');
        eventBus
          .emit(events.telemetry.sendOk, {
            serviceName,
            environment,
            clientId,
            oTelAddress,
          })
          .catch(() => {});
      } else {
        logger.debug('exporting spans failed with error: %o', result.error);
        eventBus
          .emit(events.telemetry.sendFailed, {
            serviceName,
            environment,
            clientId,
            oTelAddress,
          })
          .catch(() => {});
      }
      originalCallback(result);
    };

    this.exporter.export(spans, callback);
  }

  async shutdown(): Promise<void> {
    return this.exporter.shutdown();
  }

  async forceFlush(): Promise<void> {
    return this.exporter.forceFlush();
  }
}
