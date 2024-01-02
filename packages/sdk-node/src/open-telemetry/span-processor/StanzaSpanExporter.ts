import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Metadata } from '@grpc/grpc-js';
import {
  addAuthTokenListener,
  eventBus,
  events,
  getStanzaAuthToken,
  hubService,
} from '@getstanza/sdk-base';
import { createUserAgentHeader } from '@getstanza/sdk-utils';
import { sdkOptions } from '../../sdkOptions';

export class StanzaSpanExporter extends OTLPTraceExporter {
  constructor(
    traceConfig: { collectorUrl: string },
    serviceName: string,
    serviceRelease: string
  ) {
    const metadata = new Metadata();
    let authToken = getStanzaAuthToken();
    if (authToken !== undefined) {
      metadata.set('Authorization', `bearer ${authToken}`);
    }
    metadata.set(
      'User-Agent',
      createUserAgentHeader({
        ...sdkOptions,
        serviceName,
        serviceRelease,
      })
    );
    super({
      url: traceConfig.collectorUrl,
      metadata,
    });

    addAuthTokenListener((newToken) => {
      authToken = newToken;
      if (authToken !== undefined) {
        this.metadata?.set('Authorization', `bearer ${authToken}`);
      }
    });
  }

  override send(
    ...[objects, onSuccess, onError]: Parameters<OTLPTraceExporter['send']>
  ) {
    const stanzaOnSuccess: typeof onSuccess = () => {
      const { serviceName, environment, clientId } =
        hubService.getServiceMetadata();
      eventBus
        .emit(events.telemetry.sendOk, {
          serviceName,
          environment,
          clientId,
          oTelAddress: this.url,
        })
        .catch(() => {});
      onSuccess();
    };

    const stanzaOnError: typeof onError = (error) => {
      const { serviceName, environment, clientId } =
        hubService.getServiceMetadata();
      eventBus
        .emit(events.telemetry.sendFailed, {
          serviceName,
          environment,
          clientId,
          oTelAddress: this.url,
        })
        .catch(() => {});
      onError(error);
    };

    super.send(objects, stanzaOnSuccess, stanzaOnError);
  }
}
