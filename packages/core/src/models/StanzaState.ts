import { type Feature, validateFeature } from './Feature'

interface StanzaState {
  Features: Feature[]
  GlobalMessage: string | undefined
  Tag?: string | undefined
}

export const createStanzaState = (features: Feature[], message: string, tag: string | undefined): StanzaState => {
  // validate that features passed are properly formed
  features.forEach(validateFeature)

  const state: StanzaState = {
    Features: features,
    GlobalMessage: message,
    Tag: tag
  }

  return state
}

export type { StanzaState }
