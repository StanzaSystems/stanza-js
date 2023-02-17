import { ActionCode, type Feature } from '../models/Feature'
import globals from '../globals'

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

export async function getBrowserFeatures (contextName: string): Promise<BrowserFeature[]> {
  console.log(`refresh ${contextName}`)
  const params = new URLSearchParams()
  const featureGroup = globals.getConfig().contextConfigs.find((e) => { return e.name === contextName })
  featureGroup?.features?.forEach(s => { params.append('feature', s) })
  const response = await fetch(`${globals.getConfig().url}/v1/config/browser?${params.toString()}`, {
    headers: {
      'x-stanza-customer-id': globals.getConfig().stanzaCustomerId
    }
  }).catch((e) => { console.log(e) })
  const data: JSONResponse = await response?.json()
  console.log(data)
  return data?.Features ?? []
}

export function createContextFeaturesFromResponse (featureResponse: BrowserFeature[], enablementNumber: number): Feature[] {
  const response: Feature[] = []

  featureResponse.forEach((f) => {
    /// if the enabled percent is less than this context's enablement number, this feature is enabled
    if (f.enabledPercent > enablementNumber) {
      if (f.actionCodeEnabled === undefined || ActionCode[f.actionCodeEnabled] === undefined) {
        console.log(`feature ${f.featureName} has an unknown or invalid enabled action code ${f.actionCodeEnabled}. Stanza fails open.`)
      } else {
        const feature: Feature = {
          name: f.featureName,
          code: f.actionCodeEnabled,
          message: f.messageEnabled
        }
        response.push(feature)
      }
    } else {
      /// if not use values for a disabled feature
      if (f.actionCodeDisabled === undefined || ActionCode[f.actionCodeDisabled] === undefined) {
        console.log(`feature ${f.featureName} has an unknown or invalid disabled action code ${f.actionCodeDisabled}. Stanza fails open.`)
      } else {
        const feature: Feature = {
          name: f.featureName,
          code: f.actionCodeDisabled,
          message: f.messageDisabled
        }
        response.push(feature)
      }
    }
  })
  return response
}
