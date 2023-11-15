import { type TextMapPropagator } from '@opentelemetry/api';
import { stanzaApiKeyContextKey } from '../context/stanzaApiKeyContextKey';
import { HeaderContextPropagator } from './HeaderContextPropagator';

const headerApiKey = 'x-stanza-key';

export class StanzaApiKeyPropagator
  extends HeaderContextPropagator
  implements TextMapPropagator
{
  constructor() {
    super(headerApiKey, stanzaApiKeyContextKey);
  }
}
