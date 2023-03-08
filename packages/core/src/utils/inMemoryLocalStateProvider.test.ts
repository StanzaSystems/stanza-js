import { describe, expect, it } from 'vitest'
import { type FeatureState } from '../models/featureState'
import { createInMemoryLocalStateProvider } from './inMemoryLocalStateProvider'

describe('InMemoryLocalStateProvider', () => {
  const testFeatures = {
    first: {
      featureName: 'firstFeature',
      lastRefreshTime: 123,
      enabledPercent: 100
    },
    second: {
      featureName: 'secondFeature',
      lastRefreshTime: 124,
      enabledPercent: 80,
      actionCodeDisabled: 1,
      actionCodeEnabled: 0,
      messageDisabled: 'Message disabled',
      messageEnabled: 'Message enabled'
    },
    third: {
      featureName: 'thirdFeature',
      lastRefreshTime: 125,
      enabledPercent: 0,
      actionCodeDisabled: 2,
      messageDisabled: 'Third feature is messed up'
    }
  } satisfies Record<string, FeatureState>

  it('should return undefined from empty store', () => {
    const provider = createInMemoryLocalStateProvider()

    expect(provider.getFeatureState('firstFeature')).toBeUndefined()
  })

  it('should store and retrieve a feature', () => {
    const provider = createInMemoryLocalStateProvider()

    provider.setFeatureState(testFeatures.first)
    expect(provider.getFeatureState('firstFeature')).toBe(testFeatures.first)
  })

  it('should return undefined if feature doesn\'t exist in store', () => {
    const provider = createInMemoryLocalStateProvider()

    provider.setFeatureState(testFeatures.first)
    expect(provider.getFeatureState('secondFeature')).toBeUndefined()
  })

  it('should return undefined if feature doesn\'t exist in store', () => {
    const provider = createInMemoryLocalStateProvider()

    provider.setFeatureState(testFeatures.first)
    expect(provider.getFeatureState('secondFeature')).toBeUndefined()
  })

  it('should return all features from the store', () => {
    const provider = createInMemoryLocalStateProvider()

    provider.setFeatureState(testFeatures.first)
    provider.setFeatureState(testFeatures.second)
    provider.setFeatureState(testFeatures.third)
    expect(provider.getAllFeatureStates()).toEqual([testFeatures.first, testFeatures.second, testFeatures.third])
  })
})
