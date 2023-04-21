import { type Context } from '@opentelemetry/api'
import { stanzaPriorityBoostContextKey } from './stanzaPriorityBoostContextKey'

export const addPriorityBoostToContext = (priorityBoost: number) => (context: Context): Context => {
  const currentContextPriorityBoost = context.getValue(stanzaPriorityBoostContextKey)

  const currentPriorityBoost = typeof (currentContextPriorityBoost) === 'number' ? currentContextPriorityBoost : 0

  const totalPriorityBoost = currentPriorityBoost + priorityBoost
  return totalPriorityBoost !== 0
    ? context.setValue(stanzaPriorityBoostContextKey, totalPriorityBoost)
    : context.deleteValue(stanzaPriorityBoostContextKey)
}
