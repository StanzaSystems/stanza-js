import { beforeEach, describe, it } from 'vitest';

const REQUEST_TIMEOUT_SYMBOL: unique symbol = Symbol.for(
  '[Stanza SDK Internal] Request timeout',
);
describe('requestTimeout', () => {
  beforeEach(() => {
    vi.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as any)[REQUEST_TIMEOUT_SYMBOL];
  });

  it('should have default value', async () => {
    const { STANZA_REQUEST_TIMEOUT } = await import('./requestTimeout');

    expect(STANZA_REQUEST_TIMEOUT).toEqual(300);
  });

  it('should preserve set value after module resets', async () => {
    const {
      STANZA_REQUEST_TIMEOUT: STANZA_REQUEST_TIMEOUT_1,
      setRequestTimeout,
    } = await import('./requestTimeout');
    expect(STANZA_REQUEST_TIMEOUT_1).toEqual(300);

    setRequestTimeout(1234);

    const { STANZA_REQUEST_TIMEOUT: STANZA_REQUEST_TIMEOUT_2 } = await import(
      './requestTimeout'
    );

    expect(STANZA_REQUEST_TIMEOUT_2).toEqual(1234);
  });

  it('should fallback to default after module and globalThis resets', async () => {
    const { setRequestTimeout } = await import('./requestTimeout');

    setRequestTimeout(1234);

    const { STANZA_REQUEST_TIMEOUT: STANZA_REQUEST_TIMEOUT_1 } = await import(
      './requestTimeout'
    );

    expect(STANZA_REQUEST_TIMEOUT_1).toEqual(1234);

    vi.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as any)[REQUEST_TIMEOUT_SYMBOL];

    const { STANZA_REQUEST_TIMEOUT: STANZA_REQUEST_TIMEOUT_2 } = await import(
      './requestTimeout'
    );

    expect(STANZA_REQUEST_TIMEOUT_2).toEqual(300);
  });
});
