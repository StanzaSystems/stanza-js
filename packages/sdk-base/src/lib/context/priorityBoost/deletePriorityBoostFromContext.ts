import { type Context } from '@opentelemetry/api';
import { stanzaPriorityBoostContextKey } from './stanzaPriorityBoostContextKey';

export const deletePriorityBoostFromContext = (context: Context): Context => {
  return context.deleteValue(stanzaPriorityBoostContextKey);
};
