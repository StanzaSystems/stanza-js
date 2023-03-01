import { type FeatureState } from './models/featureState'

export interface StanzaState {
  featureStates: FeatureState[]
}

class StanzaChangeEvent<Evt> extends Event {
  public readonly detail: Evt

  constructor (state: Evt) {
    super('stanzaStateChanged')
    this.detail = state
  }
}

type StanzaListener<Evt, Ret = unknown> = (evt: Evt) => Ret

export interface StanzaChangeEmitter<Evt> {
  addChangeListener: (callback: StanzaListener<Evt>) => () => void
  removeChangeListener: (callback: StanzaListener<Evt>) => void
  dispatchChange: (state: Evt) => void
}

export class StanzaChangeTarget<Evt> implements StanzaChangeEmitter<Evt> {
  private readonly eventTarget = new EventTarget()
  private readonly unsubscribeMap = new Map<StanzaListener<Evt>, () => void>()

  addChangeListener (callback: StanzaListener<Evt>): () => void {
    const eventListener = (evt: unknown): void => {
      if (!(evt instanceof StanzaChangeEvent)) {
        return
      }
      callback(evt.detail)
    }

    const unsubscribe = (): void => {
      this.unsubscribeMap.delete(callback)
      this.eventTarget.removeEventListener('stanzaStateChanged', eventListener)
    }

    this.unsubscribeMap.set(callback, unsubscribe)
    this.eventTarget.addEventListener('stanzaStateChanged', eventListener)

    return unsubscribe
  }

  removeChangeListener (callback: StanzaListener<Evt>): void {
    const unsubscribe = this.unsubscribeMap.get(callback)

    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  }

  dispatchChange (state: Evt): void {
    this.eventTarget.dispatchEvent(new StanzaChangeEvent(state))
  }
}
