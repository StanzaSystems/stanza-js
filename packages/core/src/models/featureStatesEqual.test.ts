import { describe, expect, it } from 'vitest'
import { type FeatureState } from './featureState'
import { featureStatesEqual } from './featureStatesEqual'

describe('featureStatesEqual', () => {
  it('should equal to itself', () => {
    const featureState: FeatureState = {
      featureName: 'feature1',
      enabledPercent: 100,
      lastRefreshTime: 123
    }
    expect(featureStatesEqual(featureState, featureState)).toBe(true)
  })

  it('should equal to same object', () => {
    const featureStateFirst: FeatureState = {
      featureName: 'feature1',
      enabledPercent: 100,
      lastRefreshTime: 123
    }
    const featureStateSecond: FeatureState = {
      featureName: 'feature1',
      enabledPercent: 100,
      lastRefreshTime: 123
    }
    expect(featureStatesEqual(featureStateFirst, featureStateSecond)).toBe(true)
  })

  it('should not equal if fields are different', () => {
    const featureStateFirst: FeatureState = {
      featureName: 'feature1',
      enabledPercent: 100,
      lastRefreshTime: 123
    }
    const featureStateSecond: FeatureState = {
      featureName: 'feature2',
      enabledPercent: 100,
      lastRefreshTime: 123
    }
    expect(featureStatesEqual(featureStateFirst, featureStateSecond)).toBe(
      false
    )
  })
})
