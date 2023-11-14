import { createGlobalState } from './createGlobalState';

const state = createGlobalState(
  Symbol.for('[Stanza SDK Internal] Auth bearer token'),
  (): string | undefined => undefined,
);

export const updateStanzaAuthToken = state.update;

export const addAuthTokenListener = state.onChange;

export const getStanzaAuthToken = () => state.currentValue;
