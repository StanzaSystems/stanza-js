import { eventBus, events } from '../global/eventBus'

export const backoffGetQuota = <Args extends any[], ReturnType>(getQuotaFn: (...args: Args) => Promise<ReturnType | null>): (...args: Args) => Promise<ReturnType | null> => {
  let successCount = 0
  let failureCount = 0
  let enabled = true
  eventBus.on(events.internal.quota.succeeded, () => {
    successCount++
  })
  eventBus.on(events.internal.quota.failed, () => {
    failureCount++
  })

  setInterval(() => {
    const totalCount = successCount + failureCount

    if (totalCount === 0) {
      return
    }

    const ratio = failureCount / totalCount
    if (ratio > 0.1) {
      enabled = false
    }

    successCount = 0
    failureCount = 0
  }, 1000)
  // const tryRampUpEnabledPercent =

  return async (...args: Args) => {
    return enabled ? getQuotaFn(...args) : Promise.resolve(null)
  }
}
