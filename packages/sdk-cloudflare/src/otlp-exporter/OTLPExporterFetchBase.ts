/*
 * Based on: https://github.com/open-telemetry/opentelemetry-js/blob/3e5929132129ed6022adbd05d085b998cb03e3d5/experimental/packages/otlp-exporter-base/src/platform/node/OTLPExporterNodeBase.ts
 *
 * Adjusted to work with fetch API instead of http/https
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

import { diag } from '@opentelemetry/api';
import { getEnv, baggageUtils } from '@opentelemetry/core';
import {
  OTLPExporterBase,
  type OTLPExporterError,
} from '@opentelemetry/otlp-exporter-base';
import { type OTLPExporterFetchConfigBase } from './types';
import { parseHeaders } from './util';
import { sendWithFetch } from './fetchUtil';

/**
 * Collector Metric Exporter abstract base class
 */
export abstract class OTLPExporterFetchBase<
  ExportItem,
  ServiceRequest,
> extends OTLPExporterBase<
  OTLPExporterFetchConfigBase,
  ExportItem,
  ServiceRequest
> {
  DEFAULT_HEADERS: Record<string, string> = {};
  headers: Record<string, string>;

  constructor(config: OTLPExporterFetchConfigBase = {}) {
    super(config);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((config as any).metadata != null) {
      diag.warn('Metadata cannot be set when using fetch');
    }
    this.headers = Object.assign(
      this.DEFAULT_HEADERS,
      parseHeaders(config.headers),
      baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_HEADERS)
    );
  }

  onInit(_config: OTLPExporterFetchConfigBase): void {}

  send(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }
    const serviceRequest = this.convert(objects);

    const promise = new Promise<void>((resolve, reject) => {
      sendWithFetch(
        this,
        JSON.stringify(serviceRequest),
        'application/json',
        resolve,
        reject
      );
    }).then(onSuccess, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      Promise.allSettled(this._sendingPromises.splice(index, 1)).catch(
        () => {}
      );
    };
    promise.then(popPromise, popPromise);
  }

  onShutdown(): void {}
}
