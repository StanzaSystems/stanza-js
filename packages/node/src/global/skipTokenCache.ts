import { createGlobal } from './createGlobal';

export let STANZA_SKIP_TOKEN_CACHE = createGlobal(
  Symbol.for('[Stanza SDK Internal] Skip token cache'),
  () => false,
);

export const setSkipTokenCache = (timeout: boolean) => {
  STANZA_SKIP_TOKEN_CACHE = timeout;
};
