import type { TextMapGetter } from '@opentelemetry/api';

export const headersGetter: TextMapGetter<Headers> = {
  get(carrier, key) {
    if (carrier == null) {
      return undefined;
    }
    return carrier.get(key) ?? undefined;
  },
  keys(carrier) {
    if (carrier == null) {
      return [];
    }
    return Array.from(carrier.keys());
  },
};
