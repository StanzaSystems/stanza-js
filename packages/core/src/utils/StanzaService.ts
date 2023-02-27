import { getConfig } from '../globals'
import { ActionCode, type Feature } from '../models/Feature'

interface JSONResponse {
  Features?: BrowserFeature[]
}

export interface BrowserFeature {
  featureName: string
  enabledPercent: number
  actionCodeEnabled?: number
  messageEnabled?: string
  actionCodeDisabled?: number
  messageDisabled?: string
}

interface BrowserFeaturesCache {
  get: (key: string) => BrowserFeature[] | undefined
  set: (key: string, value: BrowserFeature[]) => void
  has: (key: string) => void
}

const browserFeaturesCache: BrowserFeaturesCache = new Map()

export async function getBrowserFeatures (contextName: string): Promise<BrowserFeature[]> {
  console.log(`refresh ${contextName}`)
  const params = new URLSearchParams()
  const { contextConfigs, url, stanzaCustomerId } = getConfig()
  const featureGroup = contextConfigs.find((e) => {
    return e.name === contextName
  })
  featureGroup?.features?.forEach(s => {
    params.append('feature', s)
  })
  const browserFeaturesUrl = `${url}/v1/config/browser?${params.toString()}`
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
    const data: JSONResponse = await response?.json()
    console.log(data)
    const browserFeatures = data?.Features ?? []
    browserFeaturesCache.set(browserFeaturesUrl, browserFeatures)
    return browserFeatures
  }
  // TODO: should we throw we receive unexpected status code?
  return []
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
