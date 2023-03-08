import { type ApiFeatureState } from './featureState'
import { type ApiFeaturesResponse } from './featureStateResponse'
import { getConfig } from '../globals'

interface ApiFeatureStateCache {
  get: (key: string) => ApiFeatureState[] | undefined
  set: (key: string, value: ApiFeatureState[]) => void
  has: (key: string) => void
}

const browserFeaturesCache: ApiFeatureStateCache = new Map()

export async function fetchApiFeaturesStates (features: string[]): Promise<ApiFeatureState[]> {
  const { stanzaCustomerId } = getConfig()
  const browserFeaturesUrl = getBrowserFeaturesUrl(features)
  const response = await fetch(browserFeaturesUrl, {
    headers: {
      'x-stanza-customer-id': stanzaCustomerId
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
    const featureStates = (data?.Features ?? [])
    browserFeaturesCache.set(browserFeaturesUrl, featureStates)
    return featureStates
  }
  // TODO: should we throw we receive unexpected status code?
  return []
}

function getBrowserFeaturesUrl (features: string[]): string {
  const { url } = getConfig()
  const params = new URLSearchParams()
  features.forEach(s => {
    params.append('feature', s)
  })
  return `${url}/v1/config/browser?${params.toString()}`
}
