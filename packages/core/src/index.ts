import { getFeatureStates } from './getFeatureStates'
import { getFeatureStatesHot } from './getFeatureStatesHot'
import { getFeatureStatesStale } from './getFeatureStatesStale'
import * as globals from './globals'
import { init } from './init'
export * from './eventEmitter'

export { ActionCode } from './models/Feature'
export type { FeatureState } from './models/featureState'
export type { LocalStateProvider } from './models/localStateProvider'
export type { StanzaCoreConfig } from './models/StanzaCoreConfig'

export const utils = {
  globals
}

export const Stanza = {
  init,
  getFeatureStatesHot,
  getFeatureStatesStale,
  getFeatureStates,
  featureChanges: globals.featureChanges,
  enablementNumberChanges: globals.enablementNumberChanges
}

export const identity = <V>(value: V): V => value

type MapValueFn<V, R> = (value: V) => R

export function groupBy<V extends Record<K, string>, K extends string, R = V> (key: K, mapValue: MapValueFn<V, R>) {
  return (grouped: Record<V[K], R>, value: V) => {
    const valueElement = value[key]
    grouped[valueElement] = mapValue(value)
    return grouped
  }
}

export default Stanza
