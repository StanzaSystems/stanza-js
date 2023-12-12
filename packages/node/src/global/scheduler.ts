import { createGlobal } from './createGlobal';
import { DEFAULT_SCHEDULER, type Scheduler } from '../utils/scheduler';

export let STANZA_SCHEDULER = createGlobal(
  Symbol.for('[Stanza SDK Internal] Scheduler'),
  () => DEFAULT_SCHEDULER
);

export const setScheduler = (scheduler: Scheduler) => {
  STANZA_SCHEDULER = scheduler;
};
