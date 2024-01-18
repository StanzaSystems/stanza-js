import { type OTLPExporterFetchBase } from './OTLPExporterFetchBase';
import { OTLPExporterError } from '@opentelemetry/otlp-exporter-base';
import {
  DEFAULT_EXPORT_BACKOFF_MULTIPLIER,
  DEFAULT_EXPORT_INITIAL_BACKOFF,
  DEFAULT_EXPORT_MAX_ATTEMPTS,
  DEFAULT_EXPORT_MAX_BACKOFF,
  isExportRetryable,
  parseRetryAfterToMills,
} from './util';
import { diag } from '@opentelemetry/api';

export function sendWithFetch<ExportItem, ServiceRequest>(
  collector: OTLPExporterFetchBase<ExportItem, ServiceRequest>,
  body: string,
  contentType: string,
  onSuccess: () => void,
  onError: (error: Error) => void
): void {
  const exporterTimeout = collector.timeoutMillis;
  const parsedUrl = new URL(collector.url);
  let retryTimer: ReturnType<typeof setTimeout>;
  let reqIsDestroyed = false;

  const exporterTimer = setTimeout(() => {
    clearTimeout(retryTimer);
    reqIsDestroyed = true;

    if (abortController.signal.aborted) {
      const message =
        abortController.signal.reason instanceof Error
          ? abortController.signal.reason.message
          : 'Request Timeout';
      const err = new OTLPExporterError(message);
      onError(err);
    } else {
      abortController.abort(new Error('Request Timeout'));
    }
  }, exporterTimeout);

  const abortController = new AbortController();

  const options: RequestInit = {
    method: 'POST',
    headers: new Headers({
      'Content-Type': contentType,
      ...collector.headers,
    }),
    body,
    signal: abortController.signal,
  };

  const sendWithRetry = (
    retries = DEFAULT_EXPORT_MAX_ATTEMPTS,
    minDelay = DEFAULT_EXPORT_INITIAL_BACKOFF
  ) => {
    fetch(parsedUrl, options)
      .then(async (res) => {
        if (!reqIsDestroyed) {
          if (res.status < 299) {
            diag.debug(
              `statusCode: ${res.status}`,
              await res.text().catch(() => '')
            );
            onSuccess();
            // clear all timers since request was completed and promise was resolved
            clearTimeout(exporterTimer);
            clearTimeout(retryTimer);
          } else if (isExportRetryable(res.status) && retries > 0) {
            let retryTime: number;
            minDelay = DEFAULT_EXPORT_BACKOFF_MULTIPLIER * minDelay;

            // retry after interval specified in Retry-After header
            const retryAfterHeader = res.headers.get('retry-after');
            if (retryAfterHeader !== undefined && retryAfterHeader !== '') {
              retryTime = parseRetryAfterToMills(retryAfterHeader);
            } else {
              // exponential backoff with jitter
              retryTime = Math.round(
                Math.random() * (DEFAULT_EXPORT_MAX_BACKOFF - minDelay) +
                  minDelay
              );
            }

            retryTimer = setTimeout(() => {
              sendWithRetry(retries - 1, minDelay);
            }, retryTime);
          } else {
            const error = new OTLPExporterError(
              res.statusText,
              res.status,
              await res.text().catch(() => '')
            );
            onError(error);
            // clear all timers since request was completed and promise was resolved
            clearTimeout(exporterTimer);
            clearTimeout(retryTimer);
          }
        }
      })
      .catch((error) => {
        onError(
          reqIsDestroyed
            ? new OTLPExporterError('Request Timeout')
            : error instanceof Error
              ? error
              : new OTLPExporterError('Unknown Error')
        );
        clearTimeout(exporterTimer);
        clearTimeout(retryTimer);
      });
  };
  sendWithRetry();
}
