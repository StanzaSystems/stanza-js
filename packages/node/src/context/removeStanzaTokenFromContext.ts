import { type Context } from '@opentelemetry/api';
import { stanzaTokenContextKey } from './stanzaTokenContextKey';

export const removeStanzaTokenFromContext =
  () =>
  (context: Context): Context =>
    context.deleteValue(stanzaTokenContextKey);
