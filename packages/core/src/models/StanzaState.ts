import { type Feature, validateFeature } from './Feature'

interface StanzaState {
  Features: Feature[]
  Version?: string
  Page: string
}

export const createStanzaState = (features: Feature[], page: string | undefined): StanzaState => {
  // validate that features passed are properly formed
  features.forEach(validateFeature)

  const state: StanzaState = {
    Features: features,
    Page: page ?? ''
  }

  return state
}

export type { StanzaState }
