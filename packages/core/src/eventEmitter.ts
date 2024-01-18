import Emittery from 'emittery';

class StanzaChangeEvent<StanzaEvent> {
  constructor(public readonly detail: StanzaEvent) {}
}

type StanzaListener<StanzaEvent, ListenerReturnValue = unknown> = (
  event: StanzaEvent
) => ListenerReturnValue;

export interface StanzaChangeEmitter<StanzaEvent> {
  addChangeListener: (callback: StanzaListener<StanzaEvent>) => () => void;
  removeChangeListener: (callback: StanzaListener<StanzaEvent>) => void;
  dispatchChange: (state: StanzaEvent) => void;
}

export class StanzaChangeTarget<StanzaEvent>
  implements StanzaChangeEmitter<StanzaEvent>
{
  private readonly eventTarget = new Emittery();
  private readonly unsubscribeMap = new Map<
    StanzaListener<StanzaEvent>,
    () => void
  >();

  addChangeListener(callback: StanzaListener<StanzaEvent>): () => void {
    const eventListener = (event: unknown): void => {
      if (!(event instanceof StanzaChangeEvent)) {
        return;
      }
      callback(event.detail as StanzaEvent);
    };

    const unsubscribe = (): void => {
      this.unsubscribeMap.delete(callback);
      this.eventTarget.off('stanzaStateChanged', eventListener);
    };

    this.unsubscribeMap.set(callback, unsubscribe);
    this.eventTarget.on('stanzaStateChanged', eventListener);

    return unsubscribe;
  }

  removeChangeListener(callback: StanzaListener<StanzaEvent>): void {
    const unsubscribe = this.unsubscribeMap.get(callback);

    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  }

  dispatchChange(state: StanzaEvent): void {
    this.eventTarget
      .emit('stanzaStateChanged', new StanzaChangeEvent(state))
      .catch(() => {
        console.warn('Dispatching event failed');
      });
  }
}
