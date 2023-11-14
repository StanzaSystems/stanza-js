import Emittery from 'emittery';

type StanzaListener<StanzaEvent, ListenerReturnValue = unknown> = (
  event: StanzaEvent,
) => ListenerReturnValue;

export interface StanzaChangeEmitter<StanzaEvent> {
  addChangeListener: (
    callback: StanzaListener<StanzaEvent, void | Promise<void>>,
  ) => () => void;
  removeChangeListener: (
    callback: StanzaListener<StanzaEvent, void | Promise<void>>,
  ) => void;
  dispatchChange: (state: StanzaEvent) => void;
}

export class StanzaChangeTarget<StanzaEvent>
  implements StanzaChangeEmitter<StanzaEvent>
{
  private readonly emitter = new Emittery();

  addChangeListener(
    callback: StanzaListener<StanzaEvent, void | Promise<void>>,
  ) {
    this.emitter.on('change', callback);
    return () => {
      this.emitter.off('change', callback);
    };
  }

  removeChangeListener(
    callback: StanzaListener<StanzaEvent, void | Promise<void>>,
  ) {
    this.emitter.off('change', callback);
  }

  dispatchChange(state: StanzaEvent) {
    this.emitter.emit('change', state).catch((error) => {
      console.error(error);
    });
  }
}
