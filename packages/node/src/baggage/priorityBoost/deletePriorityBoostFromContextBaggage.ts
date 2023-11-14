import { type Context } from '@opentelemetry/api'
import { setPriorityBoostInContextBaggage } from './setPriorityBoostInContextBaggage'

export const deletePriorityBoostFromContextBaggage = (
  contextWithPriorityBoost: Context
): Context => {
  return setPriorityBoostInContextBaggage(0)(contextWithPriorityBoost)
}
