import { logger as rootLogger } from '@getstanza/sdk-base';
import type { Action, Scheduler } from '@getstanza/sdk-base';

const logger = rootLogger.child({}, { msgPrefix: '[Cloudflare Scheduler]' });

const queue = new Array<{
  work: AnyFunction;
  timestamp: number;
  args: unknown[];
}>();

type AnyFunction = (...args: any[]) => Promise<unknown>;

export const cloudflareScheduler = {
  schedule<TArgs extends unknown[], TResult>(
    work: Action<TArgs, TResult>,
    timeout: number = 0,
    ...args: TArgs
  ): Promise<TResult> & { cancel: () => void } {
    let _resolve: (result: TResult) => void;
    let _reject: (reason?: any) => void;

    const promise = new Promise<TResult>((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    const queueItem = {
      work: async () => {
        return Promise.resolve(work(...args))
          .then(_resolve)
          .catch(_reject);
      },
      timestamp: Date.now() + timeout,
      args,
    };
    queue.push(queueItem);

    return Object.assign(promise, {
      cancel: () => {
        const index = queue.indexOf(queueItem);
        index >= 0 && queue.splice(index, 1);
      },
    });
  },
  async runScheduled(maxTimeout = 1000) {
    logger.debug('runScheduled start: queue length: %d', queue.length);

    const internalQueue = queue.splice(0, queue.length);

    const timestampThreshold = Date.now() + maxTimeout;
    const toRun = internalQueue.filter(
      ({ timestamp }) => timestamp < timestampThreshold
    );
    const toRequeue = internalQueue.filter(
      ({ timestamp }) => timestamp >= timestampThreshold
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
      logger.error(e);
    });

    logger.debug(`runScheduled end: run %d tasks`, toRun.length);
  },
} satisfies Scheduler & { runScheduled: () => Promise<void> };
