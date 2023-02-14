import { type LocalStateProvider } from '../models/LocalStateProvider'
import { type Context } from '../models/Context'
import { type Feature } from '../models/Feature'

const localState = new Map<string, Context>()
const localFeatures = new Map<string, Feature>()

function setContext (context: Context, name?: string): void {
  name = name ?? ''
  localState.set(name, context)
}

function getContext (name?: string): Context | undefined {
  return localState.get(name ?? '')
}

function setFeature (feature: Feature): void {
  localFeatures.set(feature.name, feature)
}

function getFeature (name: string): Feature | undefined {
  return localFeatures.get(name)
}

const provider: LocalStateProvider = {
  getContext,
  setContext,
  setFeature,
  getFeature
}

export default provider
