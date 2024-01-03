// import { OTLPExporterBase } from '../../OTLPExporterBase';
// import { OTLPExporterNodeConfigBase, CompressionAlgorithm } from './types';
// import * as otlpTypes from '../../types';
// import { parseHeaders } from '../../util';
// import { createHttpAgent, sendWithHttp, configureCompression } from './util';
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
  // agent: http.Agent | https.Agent | undefined;
  // compression: CompressionAlgorithm;

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
      this._sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }

  onShutdown(): void {}
}
