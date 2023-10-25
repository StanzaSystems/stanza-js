interface WrapEvents<TResult, TArgs extends any[]> {
  success?: (result: TResult, ...args: TArgs) => void | Promise<void>
  failure?: (err: unknown, ...args: TArgs) => void | Promise<void>
  duration?: (
    duration: number,
    result: TResult | undefined,
    ...args: TArgs
  ) => void | Promise<void>
}

type AsyncFn<TArgs extends any[], TResult> = (
  ...args: TArgs
) => Promise<TResult>

export const wrapEventsAsync =
  <TArgs extends any[], TResult>(
    fn: AsyncFn<TArgs, TResult>,
    events: WrapEvents<TResult, TArgs> = {}
  ): AsyncFn<TArgs, TResult> =>
    async (...args: TArgs): Promise<TResult> => {
      const fetchGuardStart = performance.now()
      let result: TResult | undefined
      try {
        result = await fn(...args)
        Promise.resolve(events.success?.(result, ...args)).catch(() => {})
        return result
      } catch (err) {
        Promise.resolve(events.failure?.(err, ...args)).catch(() => {})
        throw err
      } finally {
        const fetchGuardEnd = performance.now()
        Promise.resolve(
          events.duration?.(fetchGuardEnd - fetchGuardStart, result, ...args)
        ).catch(() => {})
      }
    }
