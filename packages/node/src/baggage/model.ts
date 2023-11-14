export const STANZA_KEYS = ['stz-feat', 'stz-boost'] as const;
const STANZA_JAEGER_KEYS = STANZA_KEYS.map((key) => `uberctx-${key}` as const);
const STANZA_DATADOG_KEYS = STANZA_KEYS.map(
  (key) => `ot-baggage-${key}` as const,
);
export type StanzaKey = (typeof STANZA_KEYS)[number];
export type StanzaJaegerKey = (typeof STANZA_JAEGER_KEYS)[number];
export type StanzaDatadogKey = (typeof STANZA_DATADOG_KEYS)[number];
