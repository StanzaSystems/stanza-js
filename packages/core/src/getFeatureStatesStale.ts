import { getStateProvider } from './globals'
import { type FeatureState } from './models/featureState'

export function getFeatureStatesStale (features: string[]): FeatureState[] {
  return features.map(name => getStateProvider().getFeatureState(name)).filter(<T>(x: T): x is NonNullable<T> => Boolean(x))
}
