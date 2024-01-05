import { wrapEventsAsync } from './wrapEventsAsync';

describe('wrapEventsAsync', () => {
  it('should call correct events on successful execution', async () => {
    vi.useFakeTimers({});

    let resolveFn: (v: unknown) => void = () => {};
    const resultPromise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    const fn = async () => {
      return resultPromise;
    };

    const successCallback = vi.fn();
    const failureCallback = vi.fn();
    const durationCallback = vi.fn();

    const wrappedFn = wrapEventsAsync(fn, {
      success: successCallback,
      failure: failureCallback,
      duration: durationCallback,
    });

    const wrappedFnResult = wrappedFn();

    await vi.advanceTimersByTimeAsync(123.456);

    expect(successCallback).not.toHaveBeenCalled();
    expect(failureCallback).not.toHaveBeenCalled();
    expect(durationCallback).not.toHaveBeenCalled();

    resolveFn('aValue');

    await vi.advanceTimersByTimeAsync(0);

    expect(successCallback).toHaveBeenCalledOnce();
    expect(successCallback).toHaveBeenCalledWith('aValue');
    expect(failureCallback).not.toHaveBeenCalled();
    expect(durationCallback).toHaveBeenCalledOnce();
    expect(durationCallback).toHaveBeenCalledWith(123.456, 'aValue');

    await expect(wrappedFnResult).resolves.toBe('aValue');

    vi.useRealTimers();
  });

  it('should call correct events on unsuccessful execution', async () => {
    vi.useFakeTimers({});

    let rejectFn: (v: unknown) => void = () => {};
    const resultPromise = new Promise((_resolve, reject) => {
      rejectFn = reject;
    });
    const fn = async () => {
      return resultPromise;
    };

    const successCallback = vi.fn();
    const failureCallback = vi.fn();
    const durationCallback = vi.fn();

    const wrappedFn = wrapEventsAsync(fn, {
      success: successCallback,
      failure: failureCallback,
      duration: durationCallback,
    });

    const wrappedFnResult = wrappedFn();
    const wrappedFnResultExpectation =
      expect(wrappedFnResult).rejects.toThrow('kaboom');

    await vi.advanceTimersByTimeAsync(123.456);

    expect(successCallback).not.toHaveBeenCalled();
    expect(failureCallback).not.toHaveBeenCalled();
    expect(durationCallback).not.toHaveBeenCalled();

    rejectFn(new Error('kaboom'));

    await vi.advanceTimersByTimeAsync(0);

    expect(successCallback).not.toHaveBeenCalled();
    expect(failureCallback).toHaveBeenCalledOnce();
    expect(failureCallback).toHaveBeenCalledWith(new Error('kaboom'));
    expect(durationCallback).toHaveBeenCalledOnce();
    expect(durationCallback).toHaveBeenCalledWith(123.456, undefined);

    await wrappedFnResultExpectation;

    vi.useRealTimers();
  });

  it('should not interfere with the function execution if success callback throws', async () => {
    vi.useFakeTimers({});

    let resolveFn: (v: unknown) => void = () => {};
    const resultPromise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    const fn = async () => {
      return resultPromise;
    };

    const successCallback = vi.fn(async () =>
      Promise.reject(new Error('kaboom'))
    );

    const wrappedFn = wrapEventsAsync(fn, {
      success: successCallback,
    });

    const wrappedFnResult = wrappedFn();

    await vi.advanceTimersByTimeAsync(123.456);

    expect(successCallback).not.toHaveBeenCalled();

    resolveFn('aValue');

    await vi.advanceTimersByTimeAsync(0);

    expect(successCallback).toHaveBeenCalledOnce();

    await expect(wrappedFnResult).resolves.toBe('aValue');

    vi.useRealTimers();
  });

  it('should not interfere with the function execution if duration callback throws', async () => {
    vi.useFakeTimers({});

    let resolveFn: (v: unknown) => void = () => {};
    const resultPromise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    const fn = async () => {
      return resultPromise;
    };

    const durationCallback = vi.fn(async () =>
      Promise.reject(new Error('kaboom'))
    );

    const wrappedFn = wrapEventsAsync(fn, {
      duration: durationCallback,
    });

    const wrappedFnResult = wrappedFn();

    await vi.advanceTimersByTimeAsync(123.456);

    expect(durationCallback).not.toHaveBeenCalled();

    resolveFn('aValue');

    await vi.advanceTimersByTimeAsync(0);

    expect(durationCallback).toHaveBeenCalledOnce();

    await expect(wrappedFnResult).resolves.toBe('aValue');

    vi.useRealTimers();
  });

  it('should not interfere with the function execution if failure callback throws', async () => {
    vi.useFakeTimers({});

    let rejectFn: (v: unknown) => void = () => {};
    const resultPromise = new Promise((_resolve, reject) => {
      rejectFn = reject;
    });
    const fn = async () => {
      return resultPromise;
    };

    const failureCallback = vi.fn(async () =>
      Promise.reject(new Error('kaboom'))
    );

    const wrappedFn = wrapEventsAsync(fn, {
      failure: failureCallback,
    });

    const wrappedFnResult = wrappedFn();
    const wrappedFnResultExpectation =
      expect(wrappedFnResult).rejects.toThrow('rejectedValue');

    await vi.advanceTimersByTimeAsync(123.456);

    expect(failureCallback).not.toHaveBeenCalled();

    rejectFn(new Error('rejectedValue'));

    await vi.advanceTimersByTimeAsync(0);

    expect(failureCallback).toHaveBeenCalledOnce();

    await wrappedFnResultExpectation;

    vi.useRealTimers();
  });
});
