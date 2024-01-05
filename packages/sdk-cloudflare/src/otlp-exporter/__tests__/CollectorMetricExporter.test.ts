/* eslint-disable */
/*
 * Original file: https://github.com/open-telemetry/opentelemetry-js/blob/3e5929132129ed6022adbd05d085b998cb03e3d5/experimental/packages/opentelemetry-exporter-metrics-otlp-http/test/node/CollectorMetricExporter.test.ts
 *
 * This file was modified:
 * * use vi instead of sinon
 * * change references from http request method to fetch
 * * remove unnecessary tests
 * */
/*
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

import { diag, DiagLogger } from '@opentelemetry/api';
import * as assert from 'assert';
import {
  AggregationTemporalityPreference,
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
  OTLPMetricExporterOptions,
} from '@opentelemetry/exporter-metrics-otlp-http';

import { OTLPMetricExporter } from '../OTLPMetricExporter';
import {
  collect,
  ensureCounterIsCorrect,
  ensureExportMetricsServiceRequestIsSet,
  ensureHistogramIsCorrect,
  ensureObservableGaugeIsCorrect,
  HISTOGRAM_AGGREGATION_VIEW,
  mockCounter,
  mockHistogram,
  mockObservableGauge,
  setUp,
  shutdown,
} from './metricsHelper';
import {
  AggregationTemporality,
  InstrumentType,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';
import { vi, Mock } from 'vitest';
import { OTLPExporterFetchConfigBase } from '../types';

const address = 'localhost:1501';

describe('OTLPMetricExporter - with json over fetch', () => {
  let collectorExporter: OTLPMetricExporter;
  let collectorExporterConfig: OTLPExporterFetchConfigBase &
    OTLPMetricExporterOptions;
  let stubFetch: Mock;
  let metrics: ResourceMetrics;

  beforeEach(async () => {
    setUp([HISTOGRAM_AGGREGATION_VIEW]);
  });

  afterEach(async () => {
    await shutdown();
    vi.restoreAllMocks();
  });

  describe('instance', () => {
    let warnStub: Mock;

    beforeEach(() => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      warnStub = vi.fn();
      const nop = () => {};
      const diagLogger: DiagLogger = {
        debug: nop,
        error: nop,
        info: nop,
        verbose: nop,
        warn: warnStub,
      };
      diag.setLogger(diagLogger);
    });

    afterEach(() => {
      diag.disable();
    });

    it('should warn about metadata when using json', () => {
      const metadata = 'foo';
      collectorExporter = new OTLPMetricExporter({
        url: address,
        metadata,
      } as any);
      const args = warnStub.mock.calls[0];
      assert.strictEqual(args[0], 'Metadata cannot be set when using fetch');
    });
  });

  describe('temporality', () => {
    it('should use the right temporality when Cumulative preference is selected', () => {
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
      });

      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.CUMULATIVE,
        'Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.CUMULATIVE,
        'Histogram'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE,
        'UpDownCounter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous UpDownCounter'
      );
    });

    it('should use the right temporality when Delta preference is selected', () => {
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.DELTA,
      });

      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA,
        'Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.DELTA,
        'Histogram'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE,
        'UpDownCounter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.DELTA,
        'Asynchronous Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous UpDownCounter'
      );
    });

    it('should use the right temporality when LowMemory preference is selected', () => {
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.LOWMEMORY,
      });

      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA,
        'Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.DELTA,
        'Histogram'
      );
      assert.equal(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE,
        'UpDownCounter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous Counter'
      );
      assert.equal(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
        ),
        AggregationTemporality.CUMULATIVE,
        'Asynchronous UpDownCounter'
      );
    });
  });

  describe('when configuring via environment', () => {
    const envSource = process.env;
    it('should use url defined in env that ends with root path and append version and signal path', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should use url defined in env without checking if path is already present', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/metrics';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should use url defined in env and append version and signal', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should override global exporter url with signal url defined in env', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.metrics/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should add root path when signal url defined in env contains no path and no root path', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}/`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains root path but no path', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.bar/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains path', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://foo.bar/v1/metrics';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains path and ends in /', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://foo.bar/v1/metrics/';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
    });
    it('should use override url defined in env with url defined in constructor', () => {
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/metrics';
      const constructorDefinedEndpoint = 'http://constructor/v1/metrics';
      const collectorExporter = new OTLPMetricExporter({
        url: constructorDefinedEndpoint,
      });
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        constructorDefinedEndpoint
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    });
    it('should use headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(collectorExporter._otlpExporter.headers.foo, 'bar');
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should override global headers config with signal headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
      envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'foo=boo';
      const collectorExporter = new OTLPMetricExporter();
      assert.strictEqual(collectorExporter._otlpExporter.headers.foo, 'boo');
      assert.strictEqual(collectorExporter._otlpExporter.headers.bar, 'foo');
      envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should override headers defined via env with headers defined in constructor', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
      const collectorExporter = new OTLPMetricExporter({
        headers: {
          foo: 'constructor',
        },
      });
      assert.strictEqual(
        collectorExporter._otlpExporter.headers.foo,
        'constructor'
      );
      assert.strictEqual(collectorExporter._otlpExporter.headers.bar, 'foo');
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should use delta temporality defined via env', () => {
      for (const envValue of ['delta', 'DELTA', 'DeLTa', 'delta     ']) {
        envSource.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = envValue;
        const exporter = new OTLPMetricExporter();
        assert.strictEqual(
          exporter['_aggregationTemporalitySelector'],
          DeltaTemporalitySelector
        );
      }
    });
    it('should use cumulative temporality defined via env', () => {
      for (const envValue of [
        'cumulative',
        'CUMULATIVE',
        'CuMULaTIvE',
        'cumulative    ',
      ]) {
        envSource.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = envValue;
        const exporter = new OTLPMetricExporter();
        assert.strictEqual(
          exporter['_aggregationTemporalitySelector'],
          CumulativeTemporalitySelector
        );
      }
    });
    it('should use low memory temporality defined via env', () => {
      for (const envValue of [
        'lowmemory',
        'LOWMEMORY',
        'LoWMeMOrY',
        'lowmemory    ',
      ]) {
        envSource.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = envValue;
        const exporter = new OTLPMetricExporter();
        assert.strictEqual(
          exporter['_aggregationTemporalitySelector'],
          LowMemoryTemporalitySelector
        );
      }
    });
    it('should configure cumulative temporality with invalid value in env', () => {
      for (const envValue of ['invalid', ' ']) {
        envSource.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = envValue;
        const exporter = new OTLPMetricExporter();
        assert.strictEqual(
          exporter['_aggregationTemporalitySelector'],
          CumulativeTemporalitySelector
        );
      }
    });
    it('should respect explicit config over environment variable', () => {
      envSource.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'cumulative';
      const exporter = new OTLPMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.DELTA,
      });
      assert.strictEqual(
        exporter['_aggregationTemporalitySelector'],
        DeltaTemporalitySelector
      );
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      stubFetch = vi.fn(); //.mockReturnValue(fakeFetchResult.promise)
      vi.stubGlobal('fetch', stubFetch);
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        url: 'http://foo.bar.com',
        temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
      };

      collectorExporter = new OTLPMetricExporter(collectorExporterConfig);

      const counter = mockCounter();
      mockObservableGauge((observableResult) => {
        observableResult.observe(6, {});
      }, 'double-observable-gauge2');
      const histogram = mockHistogram();
      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      const { resourceMetrics, errors } = await collect();
      assert.strictEqual(errors.length, 0);
      metrics = resourceMetrics;
    });

    it('should open the connection', () =>
      new Promise<void>((done) => {
        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const args = stubFetch.mock.calls[0];
          const url = args[0] as URL;
          const options = args[1];

          assert.strictEqual(url.hostname, 'foo.bar.com');
          assert.strictEqual(options.method, 'POST');
          assert.strictEqual(url.pathname, '/');
          done();
        });
      }));

    it('should set custom headers', () =>
      new Promise<void>((done) => {
        collectorExporter.export(metrics, () => {});

        setTimeout(() => {
          const args = stubFetch.mock.calls[0];
          const options = args[1];
          assert.strictEqual(options.headers.get('foo'), 'bar');
          done();
        });
      }));

    it('should successfully send metrics', () => {
      collectorExporter.export(metrics, () => {});

      const responseBody = stubFetch.mock.calls[0][1].body;

      const json = JSON.parse(
        responseBody as string
      ) as IExportMetricsServiceRequest;
      // The order of the metrics is not guaranteed.
      const counterIndex = metrics.scopeMetrics[0].metrics.findIndex(
        (it) => it.descriptor.name === 'int-counter'
      );
      const observableIndex = metrics.scopeMetrics[0].metrics.findIndex(
        (it) => it.descriptor.name === 'double-observable-gauge2'
      );
      const histogramIndex = metrics.scopeMetrics[0].metrics.findIndex(
        (it) => it.descriptor.name === 'int-histogram'
      );

      const metric1 =
        json.resourceMetrics[0].scopeMetrics[0].metrics[counterIndex];
      const metric2 =
        json.resourceMetrics[0].scopeMetrics[0].metrics[observableIndex];
      const metric3 =
        json.resourceMetrics[0].scopeMetrics[0].metrics[histogramIndex];

      assert.ok(typeof metric1 !== 'undefined', "counter doesn't exist");
      ensureCounterIsCorrect(
        metric1,
        metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].endTime,
        metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].startTime
      );
      assert.ok(
        typeof metric2 !== 'undefined',
        "observable gauge doesn't exist"
      );
      ensureObservableGaugeIsCorrect(
        metric2,
        metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0].endTime,
        metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
          .startTime,
        6,
        'double-observable-gauge2'
      );
      assert.ok(typeof metric3 !== 'undefined', "histogram doesn't exist");
      ensureHistogramIsCorrect(
        metric3,
        metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0].endTime,
        metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0].startTime,
        [0, 100],
        [0, 2, 0]
      );

      ensureExportMetricsServiceRequestIsSet(json);
    });
  });
  describe('OTLPMetricExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', () =>
      new Promise<void>((done) => {
        const collectorExporter = new OTLPMetricExporter();
        setTimeout(() => {
          assert.strictEqual(
            collectorExporter._otlpExporter.url,
            'http://localhost:4318/v1/metrics'
          );
          done();
        });
      }));

    it('should keep the URL if included', () =>
      new Promise<void>((done) => {
        const url = 'http://foo.bar.com';
        const collectorExporter = new OTLPMetricExporter({
          url,
          temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
        });
        setTimeout(() => {
          assert.strictEqual(collectorExporter._otlpExporter.url, url);
          done();
        });
      }));
  });
});
