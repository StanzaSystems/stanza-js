import { type Feature, validateFeature } from './Feature'

interface StanzaState {
  Features: Feature[]
  Version?: string
  Group: string
}

export const createStanzaState = (features: Feature[], group: string | undefined): StanzaState => {
  // validate that features passed are properly formed
  features.forEach(validateFeature)

  const state: StanzaState = {
    Features: features,
    Group: group ?? ''
  }

  return state
}

export type { StanzaState }
