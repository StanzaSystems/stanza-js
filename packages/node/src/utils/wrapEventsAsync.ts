export const wrapEventsAsync = <TArgs extends any[], TResult>(fn: (...args: TArgs) => PromiseLike<TResult>, events: {
  success?: (result: TResult, ...args: TArgs) => void | Promise<void>
  failure?: (err: unknown, ...args: TArgs) => void | Promise<void>
  latency?: (latency: number, ...args: TArgs) => void | Promise<void>
} = {}): (...args: TArgs) => Promise<TResult> => async (...args: TArgs): Promise<TResult> => {
    const fetchDecoratorStart = performance.now()
    try {
      const result = await fn(...args)
      Promise.resolve(events.success?.(result, ...args)).catch(() => {})
      return result
    } catch (err) {
      Promise.resolve(events.failure?.(err, ...args)).catch(() => {})
      throw err
    } finally {
      const fetchDecoratorEnd = performance.now()
      Promise.resolve(events.latency?.(fetchDecoratorEnd - fetchDecoratorStart, ...args)).catch(() => {})
    }
  }
