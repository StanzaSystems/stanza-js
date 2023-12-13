export type Action<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => TResult;

export interface Scheduler {
  schedule: <TArgs extends unknown[], TResult>(
    work: Action<TArgs, TResult>,
    timeout?: number,
    ...args: TArgs
  ) => Promise<TResult>;
}

export const DEFAULT_SCHEDULER: Scheduler = {
  async schedule<TArgs extends unknown[], TResult>(
    work: Action<TArgs, TResult>,
    timeout: number = 0,
    ...args: TArgs
  ): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
      setTimeout(() => {
        Promise.resolve(work(...args))
          .then(resolve)
          .catch(reject);
      }, timeout);
    });
  },
};
