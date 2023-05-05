/**
 * Creates a new promise that will resolve with the same value as the original promise or time out if more than `timeout` milliseconds elapses.
 * @param timeout - number of milliseconds to pass before a given promise should time out
 * @param timeoutMessage - a message to pass to an error that gets thrown when the promise times out
 * @param aPromise - a promise to add timeout behavior to
 */
export const withTimeout = async <T>(timeout: number, timeoutMessage: string, aPromise: Promise<T>): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      aPromise,
      new Promise<T>((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(timeoutMessage))
        }, timeout)
      })
    ])
  } finally {
    clearTimeout(timeoutHandle)
  }
}
