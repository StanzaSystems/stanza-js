import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type FeatureState } from './featureState'
import { isFeatureStateFresh } from './isFeatureStateFresh'

const mockGetConfig = vi.fn()
vi.mock('../globals', () => {
  return {
    getConfig: () => mockGetConfig()
  }
})

describe('isFeatureFresh', () => {
  beforeEach(() => {
    mockGetConfig.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be fresh', () => {
    vi.useFakeTimers({
      now: 800
    })
    mockGetConfig.mockImplementation(() => {
      return {
        refreshSeconds: 1
      }
    })

    const featureState: FeatureState = {
      featureName: 'myFeature',
      enabledPercent: 100,
      lastRefreshTime: 0
    }
    expect(isFeatureStateFresh(featureState)).toBe(true)
  })

  it('should not be fresh', () => {
    vi.useFakeTimers({
      now: 1200
    })
    mockGetConfig.mockImplementation(() => {
      return {
        refreshSeconds: 1
      }
    })

    const featureState: FeatureState = {
      featureName: 'myFeature',
      enabledPercent: 100,
      lastRefreshTime: 0
    }
    expect(isFeatureStateFresh(featureState)).toBe(false)
  })
})
