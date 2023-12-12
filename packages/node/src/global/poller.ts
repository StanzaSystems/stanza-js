import { createGlobal } from './createGlobal';
import { startPolling } from '../utils/startPolling';
type AsyncFunction<T> = (prevResult: T | null) => Promise<T | null>;

interface Poller {
  start: <T = unknown>(
    fn: AsyncFunction<T>,
    options?: { pollInterval: number; onError?: (e: unknown) => void }
  ) => { stopPolling: () => void };
}

export let STANZA_POLLER = createGlobal(
  Symbol.for('[Stanza SDK Internal] Poller'),
  (): Poller => ({
    start: startPolling,
  })
);

export const setPoller = (poller: Poller) => {
  STANZA_POLLER = poller;
};
