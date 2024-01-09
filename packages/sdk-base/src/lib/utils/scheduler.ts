export type Action<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => TResult;

export interface Scheduler {
  schedule: <TArgs extends unknown[], TResult>(
    work: Action<TArgs, TResult>,
    timeout?: number,
    ...args: TArgs
  ) => Promise<TResult> & { cancel: () => void };
}

export const DEFAULT_SCHEDULER: Scheduler = {
  schedule<TArgs extends unknown[], TResult>(
    work: Action<TArgs, TResult>,
    timeout: number = 0,
    ...args: TArgs
  ): Promise<TResult> & { cancel: () => void } {
    let timer: NodeJS.Timeout | undefined;
    const promise = new Promise<TResult>((resolve, reject) => {
      if (timeout > 0) {
        timer = setTimeout(() => {
          Promise.resolve(work(...args))
            .then(resolve)
            .catch(reject);
        }, timeout);
      } else {
        Promise.resolve(work(...args))
          .then(resolve)
          .catch(reject);
      }
    });

    return Object.assign(promise, {
      cancel: () => {
        clearTimeout(timer);
        timer = undefined;
      },
    });
  },
};
