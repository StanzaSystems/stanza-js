import { type ApiFeatureState } from '../api/featureState'
import { type ApiFeaturesResponse } from '../api/featureStateResponse'
import { getConfig } from '../globals'
import { groupBy, identity } from '../index'
import { createFeatureState } from '../models/createFeatureState'
import { ActionCode, type Feature } from '../models/Feature'
import { type FeatureState } from '../models/featureState'

export interface BrowserFeature {
  featureName: string
  enabledPercent: number
  actionCodeEnabled?: number
  messageEnabled?: string
  actionCodeDisabled?: number
  messageDisabled?: string
}

interface ApiFeatureStateCache {
  get: (key: string) => ApiFeatureState[] | undefined
  set: (key: string, value: ApiFeatureState[]) => void
  has: (key: string) => void
}

const browserFeaturesCache: ApiFeatureStateCache = new Map()

export async function getContextBrowserFeatures (contextName: string): Promise<FeatureState[]> {
  const { contextConfigs } = getConfig()
  const featureGroup = contextConfigs[contextName]
  const features = featureGroup?.features ?? []
  return getFeatureStates(features)
}

export function createContextFeaturesFromResponse (featureResponse: BrowserFeature[], enablementNumber: number): Feature[] {
  const response: Feature[] = []

  featureResponse.forEach(({
    actionCodeEnabled,
    actionCodeDisabled,
    enabledPercent,
    featureName,
    messageEnabled,
    messageDisabled
  }) => {
    /// if the enabled percent is less than this context's enablement number, this feature is enabled
    if (enabledPercent > enablementNumber) {
      if (actionCodeEnabled === undefined || ActionCode[actionCodeEnabled] === undefined) {
        console.log(`feature ${featureName} has an unknown or invalid enabled action code ${actionCodeEnabled}. Stanza fails open.`)
      } else {
        response.push({
          name: featureName,
          code: actionCodeEnabled,
          message: messageEnabled
        })
      }
    } else {
      /// if not use values for a disabled feature
      if (actionCodeDisabled === undefined || ActionCode[actionCodeDisabled] === undefined) {
        console.log(`feature ${featureName} has an unknown or invalid disabled action code ${actionCodeDisabled}. Stanza fails open.`)
      } else {
        response.push({
          name: featureName,
          code: actionCodeDisabled,
          message: messageDisabled
        })
      }
    }
  })
  return response
}

export async function getFeatureStates (features: string[]): Promise<FeatureState[]> {
  const apiFeatureStates = await getApiFeaturesStates(features)
  const refreshTime = Date.now()
  const groupedFeatures = apiFeatureStates.map((apiFeatureState): FeatureState => ({
    ...apiFeatureState,
    lastRefreshTime: refreshTime
  })).reduce(groupBy('featureName', identity), {})

  return features.map((featureName): FeatureState => groupedFeatures[featureName] ?? createFeatureState(featureName, refreshTime))
}

async function getApiFeaturesStates (features: string[]): Promise<ApiFeatureState[]> {
  const { stanzaApiKey } = getConfig()
  const browserFeaturesUrl = getBrowserFeaturesUrl(features)
  const response = await fetch(browserFeaturesUrl, {
    headers: {
      'X-Stanza-Key': stanzaApiKey
    }
  }).catch((e) => {
    console.log(e)
  })
  if (response == null) {
    // we logged the error already in the catch
    return []
  }
  if (response.status === 304) {
    return browserFeaturesCache.get(browserFeaturesUrl) ?? []
  }
  if (response.status === 200) {
    const data: ApiFeaturesResponse = await response?.json()
    const featureStates = (data?.featureConfigs ?? [])
    browserFeaturesCache.set(browserFeaturesUrl, featureStates)
    return featureStates
  }
  // TODO: should we throw we receive unexpected status code?
  return []
}

function getBrowserFeaturesUrl (features: string[]): string {
  const { url, environment } = getConfig()
  const params = new URLSearchParams()
  features.forEach(s => {
    params.append('features', s)
  })
  params.append('environment', environment)
  return `${url}/v1/context/browser?${params.toString()}`
}
