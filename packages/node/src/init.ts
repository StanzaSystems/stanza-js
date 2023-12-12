import { initOrThrow } from './initOrThrow';
import { type StanzaInitOptions } from './stanzaInitOptions';
import { type Scheduler } from './utils/scheduler';

export const init = async (
  options: Partial<StanzaInitOptions> = {},
  scheduler?: Scheduler
) => {
  try {
    await initOrThrow(options, scheduler);
  } catch (e) {
    if (e instanceof TypeError) {
      console.warn(e.message);
    } else {
      console.warn(
        'Failed to init the Stanza SDK: %o',
        e instanceof Error ? e.message : e
      );
    }
  }
  console.log('Stanza initialized');
};
