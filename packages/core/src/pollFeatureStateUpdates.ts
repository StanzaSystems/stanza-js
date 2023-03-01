import { getFeatureStatesHot } from './getFeatureStatesHot'
import { changes, getConfig, getStateProvider } from './globals'
import { groupBy, identity } from './index'
import { featureStatesEqual } from './models/featureStatesEqual'

export async function pollFeatureStateUpdates (): Promise<void> {
  const featureStates = getStateProvider().getAllFeatureStates()
  const features = featureStates.map(({ featureName }) => featureName)
  const newFeaturesStates = await getFeatureStatesHot(features)

  const oldFeatureStatesMap = featureStates.reduce(groupBy('featureName', identity), {})

  newFeaturesStates.filter(newFeaturesState => {
    const oldFeatureState = oldFeatureStatesMap[newFeaturesState.featureName]
    return oldFeatureState == null || !featureStatesEqual(newFeaturesState, oldFeatureState)
  }).forEach(newFeaturesState => {
    changes.dispatchChange(newFeaturesState)
  })
  await poll()
  void pollFeatureStateUpdates()
}

async function poll (): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, (getConfig().refreshSeconds ?? 10) * 1000))
}
