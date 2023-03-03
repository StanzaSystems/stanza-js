import { type FeatureState, groupBy, identity, utils } from 'stanza-core'
import { ActionCode, type StanzaFeature } from './feature'

const { getEnablementNumber } = utils.globals

export interface StanzaContext {
  readonly name: string
  featuresNames: string[]
  features: Record<string, StanzaFeature>
  ready: boolean
}

export const createContext = (name: string, featureStates: FeatureState[], ready = false): StanzaContext => {
  const features = createFeaturesFromFeatureState(featureStates, getEnablementNumber()).reduce(groupBy('name', identity), {})

  return {
    name,
    featuresNames: Object.keys(features),
    features,
    ready
  }
}

export function equals (context: StanzaContext, other: StanzaContext): boolean {
  // if the feature lengths are not the same obviously context not the same
  if (context.features.length !== other.features.length) {
    return false
  }

  // for every feature, see if the other context has a feature with the exact same properties
  for (const f of Object.values(context.features)) {
    if (other.features[f.name] === undefined) {
      return false
    }
  }
  return true
}

export function createFeaturesFromFeatureState (featureResponse: FeatureState[], enablementNumber: number): StanzaFeature[] {
  const response: StanzaFeature[] = []

  featureResponse.forEach(({
    actionCodeEnabled,
    actionCodeDisabled,
    enabledPercent,
    featureName,
    messageEnabled,
    messageDisabled,
    lastRefreshTime
  }) => {
    if (enabledPercent >= 100) {
      response.push({
        code: ActionCode.ENABLED,
        name: featureName,
        lastRefreshTime
      })
    } else if (
      // if the enabled percent is less than this context's enablement number, this feature is enabled
      enabledPercent > enablementNumber
    ) {
      if (actionCodeEnabled === undefined || ActionCode[actionCodeEnabled] === undefined) {
        console.log(`feature ${featureName} has an unknown or invalid enabled action code ${actionCodeEnabled}. Stanza fails open.`)
      } else {
        response.push({
          name: featureName,
          code: actionCodeEnabled,
          message: messageEnabled,
          lastRefreshTime
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
          message: messageDisabled,
          lastRefreshTime
        })
      }
    }
  })
  return response
}
