import { type FeatureState } from './models/featureState'

interface StanzaState {
  featureStates: FeatureState[]
}

class StanzaChangeEvent extends CustomEvent<StanzaState> {
  constructor (state: StanzaState) {
    super('stanzaStateChanged', { detail: state })
  }
}

export interface StanzaChangeEmitter {
  addChangeListener: (callback: (state: unknown) => void) => void
  dispatchChange: (state: StanzaState) => void
}

export class StanzaChangeTarget implements StanzaChangeEmitter {
  private readonly eventTarget = new EventTarget()

  addChangeListener (callback: (state: StanzaState) => void): void {
    this.eventTarget.addEventListener('stanzaStateChanged', (evt) => {
      if (!(evt instanceof StanzaChangeEvent)) {
        return
      }
      callback(evt.detail)
    })
  }

  dispatchChange (state: StanzaState): void {
    this.eventTarget.dispatchEvent(new StanzaChangeEvent(state))
  }
}
