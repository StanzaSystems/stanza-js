import { eventBus, events } from '../global/eventBus'

const rampUpSteps = [1, 5, 10, 25, 50, 100]

export const backoffGetQuota = <Args extends any[], RType>(getQuotaFn: (...args: Args) => Promise<RType | null>): (...args: Args) => Promise<RType | null> => {
  let successCount = 0
  let failureCount = 0
  let enabledPercent = 100
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
      enabledPercent = 0
    } else {
      enabledPercent = rampUpSteps.find(step => step > enabledPercent) ?? 100
    }

    successCount = 0
    failureCount = 0
  }, 1000)

  return async (...args: Args) => {
    if (enabledPercent === 100) {
      return getQuotaFn(...args)
    }
    if (enabledPercent === 0) {
      return Promise.resolve(null)
    }
    const shouldEnable = (Math.random() * 100) <= enabledPercent

    return shouldEnable
      ? getQuotaFn(...args)
      : Promise.resolve(null)
  }
}
