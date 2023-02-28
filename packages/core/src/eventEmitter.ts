import { type FeatureState } from './models/featureState'

interface StanzaState {
  featureStates: FeatureState[]
}

class StanzaChangeEvent extends Event {
  public readonly detail: StanzaState
  constructor (state: StanzaState) {
    super('stanzaStateChanged')
    this.detail = state
  }
}

type StanzaChangeListener = (state: StanzaState) => unknown

export interface StanzaChangeEmitter {
  addChangeListener: (callback: StanzaChangeListener) => () => void
  removeChangeListener: (callback: StanzaChangeListener) => void
  dispatchChange: (state: StanzaState) => void
}

export class StanzaChangeTarget implements StanzaChangeEmitter {
  private readonly eventTarget = new EventTarget()
  private readonly unsubscribeMap = new Map<StanzaChangeListener, () => void>()

  addChangeListener (callback: StanzaChangeListener): () => void {
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

  removeChangeListener (callback: StanzaChangeListener): void {
    const unsubscribe = this.unsubscribeMap.get(callback)

    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  }

  dispatchChange (state: StanzaState): void {
    this.eventTarget.dispatchEvent(new StanzaChangeEvent(state))
  }
}
