import { context, metrics, propagation } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from './opentelemetry-context-async-hooks/AsyncLocalStorageContextManager';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { StanzaMetricExporter } from './open-telemetry/metric/stanzaMetricExporter';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  BatchSpanProcessor,
  PeriodicExportingMetricReader,
  StanzaApiKeyPropagator,
  StanzaBaggagePropagator,
  StanzaInstrumentation,
  StanzaTokenPropagator,
  TraceConfigOverrideAdditionalInfoPropagator,
} from '@getstanza/sdk-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { CloudflareTracerProvider } from './open-telemetry/CloudflareTracerProvider';
import {
  AlwaysOnSampler,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { sdkOptions } from './sdkOptions';

export const createInstrumentation = async ({
  serviceName,
  serviceRelease,
}: {
  serviceName: string;
  serviceRelease: string;
}) => {
  try {
    const contextManager = new AsyncLocalStorageContextManager();
    context.setGlobalContextManager(contextManager);

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
    const propagator = new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new StanzaBaggagePropagator(),
        new StanzaApiKeyPropagator(),
        new StanzaTokenPropagator(),
        new TraceConfigOverrideAdditionalInfoPropagator(),
      ],
    });
    propagation.setGlobalPropagator(propagator);

    const provider = new CloudflareTracerProvider({
      resource,
      // TODO: use proper Stanza sampler
      sampler: new AlwaysOnSampler(),
    });
    const exporter = new ConsoleSpanExporter();
    const processor = new BatchSpanProcessor(exporter);
    provider.addSpanProcessor(processor);
    provider.register({ contextManager });

    const instrumentation = new StanzaInstrumentation(
      sdkOptions.sdkName,
      sdkOptions.sdkVersion
    );
    instrumentation.enable();
  } catch (err) {
    console.warn(err);
  }
};
