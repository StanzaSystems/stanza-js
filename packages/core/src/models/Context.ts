import { getConfig, getEnablementNumber } from '../globals'
import { createContextFeaturesFromResponse, type BrowserFeature } from '../utils/StanzaService'
import { type Feature, validateFeature } from './Feature'

interface Context {
  features: Feature[]
  readonly name: string
  ready: boolean
  lastRefreshTime: number
  enablementNumber: number
  equals: (other: Context) => boolean
  refresh: (features: Feature[]) => void
  isFresh: () => boolean
}

export const createContext = (name: string | undefined, features: Feature[], enablementNumber: number, ready = false, lastRefreshTime = undefined): Context => {
  // validate that features passed are properly formed
  features.forEach(validateFeature)

  // validate enablement number is between 0 and 00
  if (enablementNumber < 0 || enablementNumber > 99) {
    throw new Error(`invalid enablement number ${enablementNumber} for context ${name}. Must be between 0 and 99`)
  }

  return {
    name: name ?? '',
    features,
    ready,
    lastRefreshTime: lastRefreshTime ?? Date.now(),
    enablementNumber,
    equals,
    refresh,
    isFresh
  }
}

export const createContextFromCacheObject = (cached: any): Context => {
  if (cached.name === undefined || typeof cached.name !== 'string') {
    throw new Error('Invalid stanza context name in cache')
  }
  if (cached.features !== undefined && !Array.isArray(cached.features)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Invalid feature object for cached context ${cached.name}`)
  }
  return createContext(cached.name, cached.features ?? [], cached.enablementNumber, false, cached.lastRefreshTime)
}

export const createContextFromBrowserResponse = (name: string | undefined, response: BrowserFeature[]): Context => {
  const enablementNumber = getEnablementNumber()
  return createContext(name, createContextFeaturesFromResponse(response, enablementNumber), enablementNumber, true)
}

function equals (this: Context, other: Context): boolean {
  // if the feature lengths are not the same obviously context not the same
  if (this.features.length !== other.features.length) {
    return false
  }

  // if enablement number changed, honestly kinda weird but return different
  if (this.enablementNumber !== other.enablementNumber) {
    return false
  }

  // for every feature, see if the other context has a feature with the exact same properties
  for (let i = 0; i < this.features.length; i++) {
    const f = this.features[i]
    if (other.features.find((o) => { return o.name === f.name && o.code === f.code && o.message === f.message }) === undefined) {
      return false
    }
  }
  return true
}

function refresh (this: Context, features: Feature[]): void {
  this.features = features
  this.lastRefreshTime = Date.now()
  this.ready = true
}

function isFresh (this: Context): boolean {
  if (this?.lastRefreshTime !== undefined && Date.now() - this?.lastRefreshTime < (getConfig().refreshSeconds ?? 30) * 1000) {
    return true
  }
  return false
}

export type { Context }
