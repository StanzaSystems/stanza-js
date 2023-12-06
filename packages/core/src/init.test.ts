import { type init as Init } from './init';
import { assert, beforeEach } from 'vitest';

let init: typeof Init;

beforeEach(async () => {
  vi.resetModules();
  init = await import('./init').then(({ init }) => init);
});

describe('init', async () => {
  it('should init Stanza core properly', async () => {
    vi.useFakeTimers();

    await init({
      environment: 'testEnvironment',
      stanzaApiKey: 'testApiKey',
      url: 'https://url.to.hub',
      contextConfigs: [],
    });

    await vi.advanceTimersByTimeAsync(0);

    assert.ok('should init without errors');

    vi.useRealTimers();
  });

  it('should NOT leak errors if pollDelay rejects', async () => {
    vi.useFakeTimers();

    await init({
      environment: 'testEnvironment',
      stanzaApiKey: 'testApiKey',
      url: 'https://url.to.hub',
      contextConfigs: [],
      pollDelay: Promise.resolve().then(async () => {
        await new Promise((resolve) => setTimeout(resolve));
        return Promise.reject(new Error('kaboom'));
      }),
    });

    await vi.advanceTimersByTimeAsync(0);

    assert.ok('should init without errors');

    const warnSpy = vi.mocked(console.warn);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      'Error while polling feature state updates',
      new Error('kaboom')
    );
    warnSpy.mockClear();

    vi.useRealTimers();
  });

  it('should NOT leak errors if pollDelay throws', async () => {
    vi.useFakeTimers();

    await init({
      environment: 'testEnvironment',
      stanzaApiKey: 'testApiKey',
      url: 'https://url.to.hub',
      contextConfigs: [],
      pollDelay: new Promise(() => {
        throw new Error('kaboom');
      }),
    });

    await vi.advanceTimersByTimeAsync(0);

    assert.ok('should init without errors');

    const warnSpy = vi.mocked(console.warn);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      'Error while polling feature state updates',
      new Error('kaboom')
    );
    warnSpy.mockClear();

    vi.useRealTimers();
  });
});
