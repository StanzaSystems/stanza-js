import { describe, expect, it, vi } from 'vitest';
import { StanzaChangeTarget } from './eventEmitter';

describe('eventEmitter', () => {
  it('should dispatch event without any listeners', () => {
    const eventEmitter = new StanzaChangeTarget<string>();

    expect(async () => {
      await eventEmitter.dispatchChange();
    }).not.toThrow();
  });

  it('should listen to a dispatched change event', async () => {
    const eventEmitter = new StanzaChangeTarget<string>();

    const calls: number[] = [];
    const listener1 = () => {
      calls.push(1);
    };

    eventEmitter.addChangeListener(listener1);

    await eventEmitter.dispatchChange();

    expect(calls).toEqual([1]);
  });

  it('should listen to a dispatched change event - multiple listeners', async () => {
    const eventEmitter = new StanzaChangeTarget<string>();

    const calls: number[] = [];

    const listener1 = () => {
      calls.push(1);
    };

    const listener2 = () => {
      calls.push(2);
    };

    const listener3 = () => {
      calls.push(3);
    };

    eventEmitter.addChangeListener(listener1);
    eventEmitter.addChangeListener(listener2);
    eventEmitter.addChangeListener(listener3);

    await eventEmitter.dispatchChange();

    expect(calls).toEqual([1, 2, 3]);
  });

  it('should not listen to a dispatched change event after it has been unsubscribed - using unsubscribe returned from addChange', async () => {
    const eventEmitter = new StanzaChangeTarget<string>();

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 = eventEmitter.addChangeListener(listener1);
    const unsubscribe2 = eventEmitter.addChangeListener(listener2);

    await eventEmitter.dispatchChange();

    expect(listener1).toHaveBeenCalledOnce();

    expect(listener2).toHaveBeenCalledOnce();

    listener1.mockReset();
    listener2.mockReset();

    unsubscribe1();

    await eventEmitter.dispatchChange();

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledOnce();

    listener1.mockReset();
    listener2.mockReset();

    unsubscribe2();

    await eventEmitter.dispatchChange();

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  it('should not listen to a dispatched change event after it has been unsubscribed - using removeChangeListener', async () => {
    const eventEmitter = new StanzaChangeTarget<string>();

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventEmitter.addChangeListener(listener1);
    eventEmitter.addChangeListener(listener2);

    await eventEmitter.dispatchChange();

    expect(listener1).toHaveBeenCalledOnce();

    expect(listener2).toHaveBeenCalledOnce();

    listener1.mockReset();
    listener2.mockReset();

    eventEmitter.removeChangeListener(listener1);

    await eventEmitter.dispatchChange();

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledOnce();

    listener1.mockReset();
    listener2.mockReset();

    eventEmitter.removeChangeListener(listener2);

    await eventEmitter.dispatchChange();

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });
});
