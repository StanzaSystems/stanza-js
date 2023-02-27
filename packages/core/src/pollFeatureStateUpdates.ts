import { Stanza, utils } from './index'

export async function pollFeatureStateUpdates (): Promise<void> {
  const featureStates = utils.globals.getStateProvider().getAllFeatureStates()
  const features = featureStates.map(({ featureName }) => featureName)
  console.log('polling features', features)
  const newFeaturesStates = await Stanza.getFeatureStatesHot(features)
  // TODO: check if changed
  Stanza.changes.dispatchChange({
    featureStates: newFeaturesStates
  })
  await poll()
  void pollFeatureStateUpdates()
}

async function poll (): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, (utils.globals.getConfig().refreshSeconds ?? 10) * 1000))
}
