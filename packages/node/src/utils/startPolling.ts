import { logger } from '../global/logger'

type AsyncFunction<T> = (prevResult: T | null) => Promise<T | null>
const DEFAULT_POLL_INTERVAL = 1000

export const startPolling = <T = unknown>(fn: AsyncFunction<T>, options: { pollInterval: number, onError?: (e: unknown) => void } = { pollInterval: DEFAULT_POLL_INTERVAL }) => {
  let shouldStop = false
  let prevResult: T | null = null
  void (async () => {
    while (true) {
      if (shouldStop) {
        break
      }
      try {
        const result: T | null = await fn(prevResult)
        if (result !== null) {
          prevResult = result
        }
      } catch (e) {
        if (options.onError !== undefined) {
          options.onError(e)
        } else {
          logger.warn('Error occurred while polling:', e instanceof Error ? e.message : e)
        }
      }
      await waitTime(options.pollInterval)
    }
  })()

  return {
    stopPolling: () => {
      shouldStop = true
    }
  }
}

async function waitTime (timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}
