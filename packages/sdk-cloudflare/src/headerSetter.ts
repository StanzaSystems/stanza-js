import type { TextMapSetter } from '@opentelemetry/api';

export const headerSetter: TextMapSetter<Headers> = {
  set(carrier, key, value) {
    if (carrier == null) {
      return;
    }
    carrier.set(key, value);
  },
};
