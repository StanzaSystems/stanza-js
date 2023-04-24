
type AsyncFunction = () => Promise<unknown>
const DEFAULT_POLL_INTERVAL = 1000

export const startPolling = (fn: AsyncFunction, options: { pollInterval: number, onError?: (e: unknown) => void } = { pollInterval: DEFAULT_POLL_INTERVAL }) => {
  let shouldStop = false
  void (async () => {
    while (true) {
      if (shouldStop) {
        break
      }
      try {
        await fn()
      } catch (e) {
        if (options.onError !== undefined) {
          options.onError(e)
        } else {
          console.warn('Error occurred while polling:', e instanceof Error ? e.message : e)
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
