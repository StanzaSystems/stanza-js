import { type Context } from '@opentelemetry/api';
import { stanzaPriorityBoostContextKey } from './stanzaPriorityBoostContextKey';
export const getPriorityBoostFromContext = (context: Context): number => {
  const contextPriorityBoostValue = context.getValue(
    stanzaPriorityBoostContextKey,
  );
  return typeof contextPriorityBoostValue === 'number' &&
    !isNaN(contextPriorityBoostValue)
    ? contextPriorityBoostValue
    : 0;
};
