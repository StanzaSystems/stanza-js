import { context, propagation } from '@opentelemetry/api';
import { headerSetter } from './headerSetter';

export const withStanzaHeaders = (headers: Headers): Headers => {
  const newHeaders = new Headers(headers);
  propagation.inject(context.active(), newHeaders, headerSetter);
  return newHeaders;
};
