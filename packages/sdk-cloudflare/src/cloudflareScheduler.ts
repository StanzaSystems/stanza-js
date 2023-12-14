import type { Action, Scheduler } from '@getstanza/sdk-base';

const queue = new Array<{
  work: AnyFunction;
  timestamp: number;
  args: unknown[];
}>();

type AnyFunction = (...args: any[]) => Promise<unknown>;

export const cloudflareScheduler = {
  async schedule<TArgs extends unknown[], TResult>(
    work: Action<TArgs, TResult>,
    timeout: number = 0,
    ...args: TArgs
  ): Promise<TResult> {
    let _resolve: (result: TResult) => void;
    let _reject: (reason?: any) => void;

    const promise = new Promise<TResult>((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    queue.push({
      work: async () => {
        return Promise.resolve(work(...args))
          .then(_resolve)
          .catch(_reject);
      },
      timestamp: Date.now() + timeout,
      args,
    });

    return promise.then((r) => {
      return r;
    });
  },
  async tick() {
    console.log('queue length:', queue.length);

    const internalQueue = queue.splice(0, queue.length);

    const timestampTheshold = Date.now() + 60 * 1000;
    const toRun = internalQueue.filter(
      ({ timestamp }) => timestamp < timestampTheshold
    );
    const toRequeue = internalQueue.filter(
      ({ timestamp }) => timestamp >= timestampTheshold
    );

    queue.push(...toRequeue);

    await Promise.all(
      toRun.map(async ({ work, timestamp, args }) => {
        const timeout = Math.max(0, timestamp - Date.now());

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            work(...args)
              .then(resolve)
              .catch(reject);
          }, timeout);
        });
      })
    ).catch((e) => {
      console.error(e);
    });

    console.log(`Run ${toRun.length} tasks`);
  },
} satisfies Scheduler & { tick: () => Promise<void> };
