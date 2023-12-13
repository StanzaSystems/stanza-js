import { logger } from '../global/logger';
import { STANZA_SCHEDULER } from '../global/scheduler';

type AsyncFunction<T> = (prevResult: T | null) => Promise<T | null>;
const DEFAULT_POLL_INTERVAL = 1000;

export const startPolling = <T = unknown>(
  fn: AsyncFunction<T>,
  options: { pollInterval: number; onError?: (e: unknown) => void } = {
    pollInterval: DEFAULT_POLL_INTERVAL,
  }
) => {
  let shouldStop = false;
  let prevResult: T | null = null;
  (async () => {
    while (true) {
      if (shouldStop) {
        break;
      }
      try {
        const result: T | null = await STANZA_SCHEDULER.schedule(
          fn,
          0,
          prevResult
        );
        if (result !== null) {
          prevResult = result;
        }
      } catch (e) {
        if (options.onError !== undefined) {
          options.onError(e);
        } else {
          logger.warn(
            'Error occurred while polling: %o',
            e instanceof Error ? e.message : e
          );
        }
      }
      await waitTime(options.pollInterval);
    }
  })().catch(() => {});

  return {
    stopPolling: () => {
      shouldStop = true;
    },
  };
  async function waitTime(timeout: number) {
    return STANZA_SCHEDULER.schedule(() => {}, timeout);
  }
};
