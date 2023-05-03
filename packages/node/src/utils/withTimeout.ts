export const withTimeout = async <T>(timeout: number, timeoutMessage: string, aPromise: Promise<T>): Promise<T> => {
  return Promise.race([
    aPromise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage))
      }, timeout)
    })
  ])
}
