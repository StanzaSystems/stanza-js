import * as oTelApi from '@opentelemetry/api';

const STANZA_API_KEY_CONTEXT_KEY_SYMBOL = Symbol.for('StanzaApiKeyContextKey');

interface StanzaApiKeyContextKeyGlobal {
  [STANZA_API_KEY_CONTEXT_KEY_SYMBOL]: symbol | undefined;
}
const stanzaApiKeyContextKeyGlobal =
  global as unknown as StanzaApiKeyContextKeyGlobal;

export const stanzaApiKeyContextKey = (stanzaApiKeyContextKeyGlobal[
  STANZA_API_KEY_CONTEXT_KEY_SYMBOL
] =
  stanzaApiKeyContextKeyGlobal[STANZA_API_KEY_CONTEXT_KEY_SYMBOL] ??
  oTelApi.createContextKey('Stanza API Key'));
