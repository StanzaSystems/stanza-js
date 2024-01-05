import { initOrThrow } from './initOrThrow';
import { type StanzaInitOptions } from './stanzaInitOptions';
import { type Scheduler } from './utils/scheduler';
import { logger } from './global/logger';

export const init = async (
  options: Partial<StanzaInitOptions> &
    Pick<StanzaInitOptions, 'createHubService'>,
  scheduler?: Scheduler
) => {
  try {
    await initOrThrow(options, scheduler);
  } catch (e) {
    if (e instanceof TypeError) {
      logger.warn(e.message);
    } else {
      logger.warn(
        'Failed to init the Stanza SDK: %o',
        e instanceof Error ? e.message : e
      );
    }
  }
  logger.debug('Stanza initialized');
};
