/* eslint-disable */
/*
 * Original file: https://github.com/open-telemetry/opentelemetry-js/blob/3e5929132129ed6022adbd05d085b998cb03e3d5/packages/sdk-metrics/src/export/PeriodicExportingMetricReader.ts
 *
 * This file was modified:
 * * import types from original '@opentelemetry/core' '@opentelemetry/sdk-metrics' libraries
 * * suppress TS warnings
 * * modify onInitialized method to use STANZA_SCHEDULER instead of setInterval for scheduling exporting of metrics
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

import * as api from '@opentelemetry/api';
import {
  internal,
  ExportResultCode,
  globalErrorHandler,
  unrefTimer,
  callWithTimeout,
  TimeoutError,
} from '@opentelemetry/core';
import { diag } from '@opentelemetry/api';
import {
  MetricProducer,
  MetricReader,
  PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { STANZA_SCHEDULER } from '../../global/scheduler';
import { logger } from '../../global/logger';

export type PeriodicExportingMetricReaderOptions = {
  /**
   * The backing exporter for the metric reader.
   */
  exporter: PushMetricExporter;
  /**
   * An internal milliseconds for the metric reader to initiate metric
   * collection.
   */
  exportIntervalMillis?: number;
  /**
   * Milliseconds for the async observable callback to timeout.
   */
  exportTimeoutMillis?: number;
  /**
   * **Note, this option is experimental**. Additional MetricProducers to use as a source of
   * aggregated metric data in addition to the SDK's metric data. The resource returned by
   * these MetricProducers is ignored; the SDK's resource will be used instead.
   * @experimental
   */
  metricProducers?: MetricProducer[];
};

/**
 * {@link MetricReader} which collects metrics based on a user-configurable time interval, and passes the metrics to
 * the configured {@link PushMetricExporter}
 */
export class PeriodicExportingMetricReader extends MetricReader {
  private _interval?: ReturnType<typeof setInterval>;
  private _exporter: PushMetricExporter;
  private readonly _exportInterval: number;
  private readonly _exportTimeout: number;

  constructor(options: PeriodicExportingMetricReaderOptions) {
    super({
      aggregationSelector: options.exporter.selectAggregation?.bind(
        options.exporter
      ),
      aggregationTemporalitySelector:
        options.exporter.selectAggregationTemporality?.bind(options.exporter),
      metricProducers: options.metricProducers,
    });

    if (
      options.exportIntervalMillis !== undefined &&
      options.exportIntervalMillis <= 0
    ) {
      throw Error('exportIntervalMillis must be greater than 0');
    }

    if (
      options.exportTimeoutMillis !== undefined &&
      options.exportTimeoutMillis <= 0
    ) {
      throw Error('exportTimeoutMillis must be greater than 0');
    }

    if (
      options.exportTimeoutMillis !== undefined &&
      options.exportIntervalMillis !== undefined &&
      options.exportIntervalMillis < options.exportTimeoutMillis
    ) {
      throw Error(
        'exportIntervalMillis must be greater than or equal to exportTimeoutMillis'
      );
    }

    this._exportInterval = options.exportIntervalMillis ?? 60000;
    this._exportTimeout = options.exportTimeoutMillis ?? 30000;
    this._exporter = options.exporter;
  }

  private async _runOnce(): Promise<void> {
    try {
      await callWithTimeout(this._doRun(), this._exportTimeout);
    } catch (err) {
      if (err instanceof TimeoutError) {
        api.diag.error(
          'Export took longer than %s milliseconds and timed out.',
          this._exportTimeout
        );
        return;
      }

      // @ts-expect-error: TS doesn't know it's api.Error
      globalErrorHandler(err);
    }
  }

  private async _doRun(): Promise<void> {
    const { resourceMetrics, errors } = await this.collect({
      timeoutMillis: this._exportTimeout,
    });

    if (errors.length > 0) {
      api.diag.error(
        'PeriodicExportingMetricReader: metrics collection errors',
        ...errors
      );
    }

    const doExport = async () => {
      const result = await internal._export(this._exporter, resourceMetrics);
      if (result.code !== ExportResultCode.SUCCESS) {
        throw new Error(
          `PeriodicExportingMetricReader: metrics export failed (error ${result.error})`
        );
      }
    };

    // Avoid scheduling a promise to make the behavior more predictable and easier to test
    if (resourceMetrics.resource.asyncAttributesPending) {
      resourceMetrics.resource
        .waitForAsyncAttributes?.()
        .then(doExport, (err) =>
          diag.debug('Error while resolving async portion of resource: ', err)
        );
    } else {
      await doExport();
    }
  }

  protected override onInitialized(): void {
    const work = () => {
      const runOnceResult = this._runOnce();
      STANZA_SCHEDULER.schedule(work, this._exportInterval).catch((err) => {
        logger.warn(err);
      });
      return runOnceResult;
    };
    // start running the work as soon as this reader is initialized.
    STANZA_SCHEDULER.schedule(work, this._exportInterval).catch((err) => {
      logger.warn(err);
    });
  }

  protected async onForceFlush(): Promise<void> {
    await this._runOnce();
    await this._exporter.forceFlush();
  }

  protected async onShutdown(): Promise<void> {
    if (this._interval) {
      clearInterval(this._interval);
    }

    await this._exporter.shutdown();
  }
}
