import { type Feature, validateFeature } from './Feature'

interface Context {
  features: Feature[]
  readonly name: string
  ready: boolean
  lastRefreshTime: string
  equals: (other: Feature[]) => boolean
  refresh: (features: Feature[]) => void
}

export const createContext = (name: string | undefined, features: Feature[], ready = false): Context => {
  // validate that features passed are properly formed
  features.forEach(validateFeature)

  const context: Context = {
    name: name ?? '',
    features,
    ready,
    lastRefreshTime: new Date().toISOString(),
    equals,
    refresh
  }

  return context
}

function equals (this: Context, features: Feature[]): boolean {
  // if the feature lengths are not the same obviously context not the same
  if (this.features.length !== features.length) {
    return false
  }

  // for every feature, see if the other context has a feature with the exact same properties
  for (let i = 0; i < this.features.length; i++) {
    const f = this.features[i]
    if (features.find((o) => { return o.name === f.name && o.code === f.code && o.message === f.message }) === undefined) {
      return false
    }
  }
  return true
}

function refresh (this: Context, features: Feature[]): void {
  this.features = features
  this.lastRefreshTime = new Date().toISOString()
  this.ready = true
}

export type { Context }
