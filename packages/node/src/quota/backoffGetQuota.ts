import { eventBus, events } from '../global/eventBus'
import { backOff } from 'exponential-backoff'
import { logger } from '../global/logger'

const rampUpSteps = [1, 5, 10, 25, 50, 100]

export const backoffGetQuota = <Args extends any[], RType>(getQuotaFn: (...args: Args) => Promise<RType | null>): (...args: Args) => Promise<RType | null> => {
  const tryRampUpEnabledPercentBackedOff = async () => backOff(tryRampUpEnabledPercent, {
    jitter: 'full',
    retry: () => {
      logger.debug('[%d] retrying ramp up', Date.now())
      disable()
      return true
    },
    // TODO: this feels a bit like a hack
    startingDelay: enabledPercent < 5 ? 2000 : 1000
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

  function intervalFunction () {
    tryRampUpEnabledPercentBackedOff()
      .then(() => {
        logger.debug('[%d] scheduling interval function 2', Date.now())
        intervalFunction()
      })
      .catch(() => {})
  }

  function checkRequestsStatus () {
    const isFailing = areRequestsFailing()
    resetRequestsCount()
    if (isFailing) {
      disable()
      logger.debug('[%d] scheduling interval function 1', Date.now())
      setTimeout(intervalFunction, 1000)
    } else {
      intervalFunction()
    }
  }

  function disable () {
    enabledPercent = 0
    eventBus.emit(events.internal.quota.disabled).catch(() => {})
    logger.error('Failed to get more than 10% of get quota requests. Failing open')
  }

  async function tryRampUpEnabledPercent () {
    enabledPercent = rampUpSteps.find(step => step > enabledPercent) ?? 100
    eventBus.emit(events.internal.quota.enabled, { enabledPercent }).catch(() => {})
    logger.info('Enabled %d%% of get quota requests', enabledPercent)

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
