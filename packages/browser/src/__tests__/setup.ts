import { type SpyInstance } from 'vitest';
import { fetch } from 'cross-fetch';
import 'vitest-localstorage-mock';
import { server } from '@getstanza/mocks-server';

// Add `fetch` polyfill.
globalThis.fetch = fetch;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
});

let errorSpy: SpyInstance | undefined;
let warnSpy: SpyInstance | undefined;

beforeEach(() => {
  errorSpy?.mockReset();
  warnSpy?.mockReset();
  errorSpy = vi.spyOn(console, 'error');
  warnSpy = vi.spyOn(console, 'warn');
});

afterEach(() => {
  expect(errorSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
});
