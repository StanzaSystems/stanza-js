import { afterAll, afterEach, beforeAll } from 'vitest';
import { fetch } from 'cross-fetch';
import 'vitest-localstorage-mock';
import { server } from '@getstanza/mocks-server';

// Add `fetch` polyfill.
global.fetch = fetch;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
});
