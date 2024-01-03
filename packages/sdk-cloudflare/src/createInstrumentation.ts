import { context, metrics, propagation } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from './opentelemetry-context-async-hooks/AsyncLocalStorageContextManager';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { StanzaMetricExporter } from './open-telemetry/metric/stanzaMetricExporter';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  PeriodicExportingMetricReader,
  StanzaApiKeyPropagator,
  StanzaBaggagePropagator,
  StanzaInstrumentation,
  StanzaTokenPropagator,
  TraceConfigOverrideAdditionalInfoPropagator,
} from '@getstanza/sdk-base';
import packageJson from '../package.json';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const createInstrumentation = async ({
  serviceName,
  serviceRelease,
}: {
  serviceName: string;
  serviceRelease: string;
}) => {
  try {
    context.setGlobalContextManager(new AsyncLocalStorageContextManager());

    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceRelease,
    });
    const meterProvider = new MeterProvider({
      resource,
      views: [],
    });
    metrics.setGlobalMeterProvider(meterProvider);
    meterProvider.addMetricReader(
      new PeriodicExportingMetricReader({
        exporter: new StanzaMetricExporter(serviceName, serviceRelease),
        exportIntervalMillis: 1000,
      })
    );
    propagation.setGlobalPropagator(
      new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new StanzaBaggagePropagator(),
          new StanzaApiKeyPropagator(),
          new StanzaTokenPropagator(),
          new TraceConfigOverrideAdditionalInfoPropagator(),
        ],
      })
    );

    const instrumentation = new StanzaInstrumentation(
      packageJson.name,
      packageJson.version
    );
    instrumentation.enable();
  } catch (err) {
    console.warn(err);
  }
};
