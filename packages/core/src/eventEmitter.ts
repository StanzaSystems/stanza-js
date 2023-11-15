import Emittery from 'emittery';

type StanzaListener<StanzaEvent, ListenerReturnValue = unknown> = (
  event: StanzaEvent
) => ListenerReturnValue;

export interface StanzaChangeEmitter<StanzaEvent> {
  addChangeListener: (
    callback: StanzaListener<StanzaEvent, Promise<void> | void>
  ) => () => void;
  removeChangeListener: (callback: StanzaListener<StanzaEvent, void>) => void;
  dispatchChange: (state?: StanzaEvent) => Promise<void>;
}

export class StanzaChangeTarget<StanzaEvent>
  implements StanzaChangeEmitter<StanzaEvent>
{
  private readonly eventTarget = new Emittery();
  private readonly unsubscribeMap = new Map<
    StanzaListener<StanzaEvent>,
    () => void
  >();

  addChangeListener(
    callback: StanzaListener<StanzaEvent, Promise<void> | void>
  ) {
    const unsubscribe = (): void => {
      this.unsubscribeMap.delete(callback);
      this.eventTarget.off('stanzaStateChanged', callback);
    };

    this.unsubscribeMap.set(callback, unsubscribe);
    this.eventTarget.on('stanzaStateChanged', callback);

    return unsubscribe;
  }

  removeChangeListener(
    callback: StanzaListener<StanzaEvent, void | Promise<void>>
  ) {
    const unsubscribe = this.unsubscribeMap.get(callback);

    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }

    this.unsubscribeMap.delete(callback);
  }

  async dispatchChange(state?: StanzaEvent) {
    await this.eventTarget.emit('stanzaStateChanged', state);
  }
}
