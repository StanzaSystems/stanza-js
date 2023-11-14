import { initOrThrow } from './initOrThrow';
import { type StanzaInitOptions } from './stanzaInitOptions';
// import { logger } from './global/logger';

export const init = async (options: Partial<StanzaInitOptions> = {}) => {
  try {
    console.log('jhfjdhfjsd')
    await initOrThrow(options);
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
