import { type Context } from '@opentelemetry/api';
import { stanzaGuardContextKey } from './stanzaGuardContextKey';

export const addStanzaGuardToContext =
  (name: string) =>
  (context: Context): Context =>
    context.setValue(stanzaGuardContextKey, name);
