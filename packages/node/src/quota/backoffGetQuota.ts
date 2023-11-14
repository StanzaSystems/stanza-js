import { eventBus, events } from '../global/eventBus'
import { backOff } from 'exponential-backoff'
import { logger } from '../global/logger'

const RAMP_UP_STEPS = [1, 5, 10, 25, 50, 100]
const FAILURE_THRESHOLD = 0.1
const INITIAL_BACKOFF_TIME = 1000
const FAILURE_RATE_CHECK_WINDOW_SIZE = 1000

export const backoffGetQuota = <Args extends any[], RType>(
  getQuotaFn: (...args: Args) => Promise<RType | null>
): ((...args: Args) => Promise<RType | null>) => {
  const tryRampUpEnabledPercentBackedOff = async () =>
    backOff(tryRampUpEnabledPercent, {
      jitter: 'full',
      retry: () => {
        logger.debug('[%d] retrying ramp up', Date.now())
        disable()
        return true
      },
      // TODO: this feels a bit like a hack
      startingDelay:
        enabledPercent < 5 ? 2 * INITIAL_BACKOFF_TIME : INITIAL_BACKOFF_TIME
    })

  let successCount = 0
  let failureCount = 0
  let enabledPercent = 100
  let checkRequestStatusTimeoutHandle: ReturnType<typeof setTimeout> | undefined
  eventBus.on(events.internal.quota.succeeded, () => {
    if (checkRequestStatusTimeoutHandle === undefined) {
      resetRequestsCount()
      checkRequestStatusTimeoutHandle = setTimeout(
        checkRequestsStatus,
        FAILURE_RATE_CHECK_WINDOW_SIZE
      )
      logger.debug('[%d] scheduling check request status', Date.now())
    }
    successCount++
  })
  eventBus.on(events.internal.quota.failed, () => {
    if (checkRequestStatusTimeoutHandle === undefined) {
      resetRequestsCount()
      checkRequestStatusTimeoutHandle = setTimeout(
        checkRequestsStatus,
        FAILURE_RATE_CHECK_WINDOW_SIZE
      )
      logger.debug('[%d] scheduling check request status', Date.now())
    }
    failureCount++
  })

  return async (...args: Args) => {
    if (enabledPercent === 100) {
      return getQuotaFn(...args)
    }
    if (enabledPercent === 0) {
      return Promise.resolve(null)
    }
    const shouldEnable = Math.random() * 100 <= enabledPercent

    return shouldEnable ? getQuotaFn(...args) : Promise.resolve(null)
  }

  function intervalFunction() {
    tryRampUpEnabledPercentBackedOff()
      .then(() => {
        if (enabledPercent < 100) {
          logger.debug('[%d] scheduling interval function', Date.now())
          intervalFunction()
        } else {
          checkRequestStatusTimeoutHandle = undefined
        }
      })
      .catch(() => {})
  }

  function checkRequestsStatus() {
    const isFailing = areRequestsFailing()
    resetRequestsCount()
    if (isFailing) {
      disable()
      logger.debug('[%d] scheduling interval function', Date.now())
      setTimeout(intervalFunction, FAILURE_RATE_CHECK_WINDOW_SIZE)
    } else if (enabledPercent < 100) {
      intervalFunction()
    } else {
      checkRequestStatusTimeoutHandle = undefined
    }
  }

  function disable() {
    enabledPercent = 0
    eventBus.emit(events.internal.quota.disabled).catch(() => {})
    logger.error(
      'Failed to get more than 10% of get quota requests. Failing open'
    )
  }

  async function tryRampUpEnabledPercent() {
    enabledPercent = RAMP_UP_STEPS.find((step) => step > enabledPercent) ?? 100
    eventBus
      .emit(events.internal.quota.enabled, { enabledPercent })
      .catch(() => {})
    logger.info('Enabled %d%% of get quota requests', enabledPercent)

    await new Promise((resolve) => {
      setTimeout(resolve, FAILURE_RATE_CHECK_WINDOW_SIZE)
    })

    const rampUpFailed = areRequestsFailing()
    resetRequestsCount()
    if (rampUpFailed) {
      throw Error(`Ramping up to ${enabledPercent} failed`)
    }
  }

  function areRequestsFailing(): boolean {
    const totalCount = successCount + failureCount

    if (totalCount === 0) {
      return false
    }

    const ratio = failureCount / totalCount

    return ratio > FAILURE_THRESHOLD
  }

  function resetRequestsCount() {
    successCount = 0
    failureCount = 0
  }
}
