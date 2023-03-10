import { getFeatureStatesHot } from './getFeatureStatesHot'
import { featureChanges, getConfig, getStateProvider } from './globals'
import { groupBy, identity } from './index'
import { featureStatesEqual } from './models/featureStatesEqual'

export async function startPollingFeatureStateUpdates (): Promise<void> {
  while (true) {
    await pollFeatureStateUpdates()
    await poll()
  }
}

async function pollFeatureStateUpdates (): Promise<void> {
  const featureStates = getStateProvider().getAllFeatureStates()
  const features = featureStates.map(({ featureName }) => featureName)
  const newFeaturesStates = await getFeatureStatesHot(features)

  const oldFeatureStatesMap = featureStates.reduce(groupBy('featureName', identity), {})

  newFeaturesStates.filter(newFeaturesState => {
    const oldFeatureState = oldFeatureStatesMap[newFeaturesState.featureName]
    return oldFeatureState == null || !featureStatesEqual(newFeaturesState, oldFeatureState)
  }).forEach(newFeaturesState => {
    featureChanges.dispatchChange(newFeaturesState)
  })
}

async function poll (): Promise<void> {
  const config = getConfig()
  const timeout = (config.refreshSeconds ?? 10) * 1000
  await new Promise(resolve => setTimeout(resolve, timeout))
}
