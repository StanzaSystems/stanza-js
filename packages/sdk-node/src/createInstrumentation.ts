import {
  StanzaApiKeyPropagator,
  StanzaBaggagePropagator,
  StanzaInstrumentation,
  StanzaSampler,
  StanzaSpanProcessor,
  StanzaTokenPropagator,
  TraceConfigOverrideAdditionalInfoPropagator,
} from '@getstanza/sdk-base';
import { HeadersSpanEnhancer } from './span/headers/HeadersSpanEnhancer';
import { createHttpHeaderGetter } from './createHttpHeaderGetter';
import packageJson from '../package.json';
import { createNodeSpanExporter } from './open-telemetry/span-processor/createNodeSpanExporter';
export const createInstrumentation = async ({
  serviceName,
  serviceRelease,
}: {
  serviceName: string;
  serviceRelease: string;
}) => {
  const { HttpInstrumentation } = await import(
    '@opentelemetry/instrumentation-http'
  );
  const headersEnhancer = new HeadersSpanEnhancer();
  const httpInstrumentation = new HttpInstrumentation({
    requestHook: (span, request) => {
      headersEnhancer.enhanceWithRequest(span, createHttpHeaderGetter(request));
    },
    responseHook: (span, response) => {
      const responseHeaderGetter = createHttpHeaderGetter(response);
      const enhanceResponse = () => {
        headersEnhancer.enhanceWithResponse(span, responseHeaderGetter);
      };

      enhanceResponse();
      response.prependListener('end', enhanceResponse);
      response.prependListener('finish', enhanceResponse);
    },
  });
  // NOTE: @opentelemetry/sdk-node needs to be required after we create the instrumentation.
  // Otherwise, the instrumentation fails to work
  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { CompositePropagator, W3CTraceContextPropagator } = await import(
    '@opentelemetry/core'
  );
  const { Resource } = await import('@opentelemetry/resources');
  const { SemanticResourceAttributes } = await import(
    '@opentelemetry/semantic-conventions'
  );
  const { PeriodicExportingMetricReader } = await import(
    '@opentelemetry/sdk-metrics'
  );
  const { StanzaMetricExporter } = await import(
    './open-telemetry/metric/stanzaMetricExporter'
  );
  const sdk = new NodeSDK({
    sampler: new StanzaSampler(),
    spanProcessor: new StanzaSpanProcessor((traceConfig) =>
      createNodeSpanExporter(traceConfig, serviceName, serviceRelease)
    ),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceRelease,
    }),
    textMapPropagator: new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new StanzaBaggagePropagator(),
        new StanzaApiKeyPropagator(),
        new StanzaTokenPropagator(),
        new TraceConfigOverrideAdditionalInfoPropagator(),
      ],
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new StanzaMetricExporter(serviceName, serviceRelease),
      exportIntervalMillis: 10000,
    }),
    instrumentations: [
      httpInstrumentation,
      new StanzaInstrumentation(packageJson.name, packageJson.version),
      // TODO: enable when FetchInstrumentation supports Node
      // ...(typeof globalThis.fetch === 'function' ? [new FetchInstrumentation()] : [])
    ],
  });
  sdk.start();
};
export {};
