import { eventBus, events } from '../global/eventBus'
import { backOff } from 'exponential-backoff'
import { logger } from '../global/logger'

const rampUpSteps = [1, 5, 10, 25, 50, 100]

export const backoffGetQuota = <Args extends any[], RType>(getQuotaFn: (...args: Args) => Promise<RType | null>): (...args: Args) => Promise<RType | null> => {
  const tryRampUpEnabledPercentBackedOff = async () => backOff(tryRampUpEnabledPercent, {
    jitter: 'full',
    retry: () => {
      enabledPercent = 0
      return true
    },
    startingDelay: 2000
  })

  let successCount = 0
  let failureCount = 0
  let enabledPercent = 100

  eventBus.on(events.internal.quota.succeeded, () => {
    successCount++
  })
  eventBus.on(events.internal.quota.failed, () => {
    failureCount++
  })
  function intervalFunction () {
    tryRampUpEnabledPercentBackedOff()
      .then(() => {
        logger.debug('[%d] scheduling interval function', Date.now())
        intervalFunction()
      })
      .catch(() => {})
  }

  function checkRequestsStatus () {
    const isFailing = areRequestsFailing()
    if (isFailing) {
      enabledPercent = 0
      logger.debug('[%d] scheduling interval function', Date.now())
      setTimeout(intervalFunction, 1000)
    } else {
      intervalFunction()
    }
    resetRequestsCount()
  }

  logger.debug('[%d] scheduling check request status', Date.now())
  setTimeout(checkRequestsStatus, 1000)

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

  async function tryRampUpEnabledPercent () {
    enabledPercent = rampUpSteps.find(step => step > enabledPercent) ?? 100
    logger.debug('[%d] ramping up to %d%%', Date.now(), enabledPercent)

    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    const rampUpFailed = areRequestsFailing()
    resetRequestsCount()
    if (rampUpFailed) {
      throw Error(`Ramping up to ${enabledPercent} failed`)
    }
  }

  function areRequestsFailing (): boolean {
    const totalCount = successCount + failureCount

    if (totalCount === 0) {
      return false
    }

    const ratio = failureCount / totalCount

    return ratio > 0.1
  }

  function resetRequestsCount () {
    successCount = 0
    failureCount = 0
  }
}
