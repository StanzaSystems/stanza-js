import { describe, expect, it } from 'vitest'
import { createFeatureState } from './createFeatureState'
import { type FeatureState } from './featureState'

describe('createFeatureState', () => {
  it('should create a feature state with default values', () => {
    expect(createFeatureState('testFeature')).toEqual({
      featureName: 'testFeature',
      enabledPercent: 100,
      lastRefreshTime: 0
    } satisfies FeatureState)
  })

  it('should create a feature state with passed refresh time', () => {
    expect(createFeatureState('testFeature', 123)).toEqual({
      featureName: 'testFeature',
      enabledPercent: 100,
      lastRefreshTime: 123
    } satisfies FeatureState)
  })
})
