import { type Context } from '@opentelemetry/api'
import { stanzaPriorityBoostContextKey } from './stanzaPriorityBoostContextKey'
import { getPriorityBoostFromContext } from './getPriorityBoostFromContext'

export const addPriorityBoostToContext = (priorityBoost: number) => (context: Context): Context => {
  const currentPriorityBoost = getPriorityBoostFromContext(context)

  const totalPriorityBoost = currentPriorityBoost + priorityBoost
  return totalPriorityBoost !== 0
    ? context.setValue(stanzaPriorityBoostContextKey, totalPriorityBoost)
    : context.deleteValue(stanzaPriorityBoostContextKey)
}
