import { type Context } from './Context'
import { type Feature } from './Feature'

export interface LocalStateProvider {
  setContext: (context: Context, name?: string) => void
  getContext: (name?: string) => Context | undefined
  setFeature: (feature: Feature) => void
  getFeature: (name: string) => Feature | undefined
}
