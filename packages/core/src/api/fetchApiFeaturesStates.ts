import { type ApiFeatureState } from './featureState'
import { type ApiFeaturesResponse } from './featureStateResponse'
import { getConfig } from '../globals'

interface ApiFeatureStatus {
  featureStates: ApiFeatureState[]
  eTag: string | undefined
}

interface ApiFeatureStateCache {
  get: (key: string) => ApiFeatureStatus | undefined
  set: (key: string, value: ApiFeatureStatus) => void
  has: (key: string) => void
}

const browserFeaturesCache: ApiFeatureStateCache = new Map()

export async function fetchApiFeaturesStates (features: string[]): Promise<ApiFeatureState[]> {
  const { stanzaApiKey } = getConfig()
  const browserFeaturesUrl = getBrowserFeaturesUrl(features)
  const existingETag = browserFeaturesCache.get(browserFeaturesUrl)?.eTag
  const response = await fetch(browserFeaturesUrl, {
    headers: {
      'X-Stanza-Key': stanzaApiKey,
      ...(existingETag !== undefined ? { 'If-None-Match': existingETag } : {})
    }
  }).catch((e) => {
    console.log(e)
  })
  if (response == null) {
    // we logged the error already in the catch
    return []
  }
  if (response.status === 304) {
    return browserFeaturesCache.get(browserFeaturesUrl)?.featureStates ?? []
  }
  if (response.status === 200) {
    const data: ApiFeaturesResponse = await response?.json()
    const featureStates = (data?.featureConfigs ?? [])
    const responseETag = response.headers.get('ETag') ?? undefined
    browserFeaturesCache.set(browserFeaturesUrl, { featureStates, eTag: responseETag })
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
