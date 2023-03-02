class StanzaChangeEvent<StanzaEvent> extends Event {
  public readonly detail: StanzaEvent

  constructor (state: StanzaEvent) {
    super('stanzaStateChanged')
    this.detail = state
  }
}

type StanzaListener<StanzaEvent, ListenerReturnValue = unknown> = (event: StanzaEvent) => ListenerReturnValue

export interface StanzaChangeEmitter<StanzaEvent> {
  addChangeListener: (callback: StanzaListener<StanzaEvent>) => () => void
  removeChangeListener: (callback: StanzaListener<StanzaEvent>) => void
  dispatchChange: (state: StanzaEvent) => void
}

export class StanzaChangeTarget<StanzaEvent> implements StanzaChangeEmitter<StanzaEvent> {
  private readonly eventTarget = new EventTarget()
  private readonly unsubscribeMap = new Map<StanzaListener<StanzaEvent>, () => void>()

  addChangeListener (callback: StanzaListener<StanzaEvent>): () => void {
    const eventListener = (event: unknown): void => {
      if (!(event instanceof StanzaChangeEvent)) {
        return
      }
      callback(event.detail)
    }

    const unsubscribe = (): void => {
      this.unsubscribeMap.delete(callback)
      this.eventTarget.removeEventListener('stanzaStateChanged', eventListener)
    }

    this.unsubscribeMap.set(callback, unsubscribe)
    this.eventTarget.addEventListener('stanzaStateChanged', eventListener)

    return unsubscribe
  }

  removeChangeListener (callback: StanzaListener<StanzaEvent>): void {
    const unsubscribe = this.unsubscribeMap.get(callback)

    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  }

  dispatchChange (state: StanzaEvent): void {
    this.eventTarget.dispatchEvent(new StanzaChangeEvent(state))
  }
}
