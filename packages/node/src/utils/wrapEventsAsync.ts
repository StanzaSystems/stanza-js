export const wrapEventsAsync = <TArgs extends any[], TResult>(fn: (...args: TArgs) => PromiseLike<TResult>, events: {
  success?: (result: TResult, ...args: TArgs) => void
  failure?: (err: unknown, ...args: TArgs) => void
  latency?: (latency: number, ...args: TArgs) => void
} = {}): (...args: TArgs) => Promise<TResult> => async (...args: TArgs): Promise<TResult> => {
    const fetchDecoratorStart = performance.now()
    try {
      const result = await fn(...args)
      const fetchDecoratorEnd = performance.now()
      events.latency?.(fetchDecoratorEnd - fetchDecoratorStart, ...args)
      events.success?.(result, ...args)
      return result
    } catch (err) {
      events.failure?.(err, ...args)

      throw err
    }
  }
