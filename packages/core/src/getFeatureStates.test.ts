import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFeatureStates } from './getFeatureStates'
import { type FeatureState } from './models/featureState'

const mockGetFeaturesStatesStale = vi.fn()
const mockGetFeaturesStatesHot = vi.fn()
const mockIsFeatureFresh = vi.fn()

vi.mock('./getFeatureStatesStale', () => {
  return {
    getFeatureStatesStale: () => mockGetFeaturesStatesStale()
  }
})

vi.mock('./getFeatureStatesHot', () => {
  return {
    getFeatureStatesHot: () => mockGetFeaturesStatesHot()
  }
})

vi.mock('./models/isFeatureStateFresh', () => {
  return {
    isFeatureStateFresh: () => mockIsFeatureFresh()
  }
})

describe('getFeatureStates', () => {
  const staleFeatureStates: FeatureState[] = [{
    featureName: 'testFeature1',
    enabledPercent: 90,
    lastRefreshTime: 123
  }, {
    featureName: 'testFeature2',
    enabledPercent: 100,
    lastRefreshTime: 123
  }]

  const hotFeatureStates: FeatureState[] = [{
    featureName: 'testFeature1',
    enabledPercent: 85,
    lastRefreshTime: 1234
  }, {
    featureName: 'testFeature2',
    enabledPercent: 90,
    lastRefreshTime: 1234
  }]

  beforeEach(() => {
    mockGetFeaturesStatesStale.mockReset()
    mockGetFeaturesStatesHot.mockReset()
    mockIsFeatureFresh.mockReset()

    mockGetFeaturesStatesStale.mockImplementation(() => {
      return staleFeatureStates
    })
    mockGetFeaturesStatesHot.mockImplementation(async () => {
      return Promise.resolve(hotFeatureStates)
    })
  })

  it('should return stale data if it exists and is fresh', async () => {
    mockIsFeatureFresh.mockImplementation(() => true)

    await expect(getFeatureStates(['testFeature1', 'testFeature2'])).resolves.toBe(staleFeatureStates)
  })

  it('should return hot data if it exists but is not fresh', async () => {
    mockIsFeatureFresh.mockImplementation(() => false)

    await expect(getFeatureStates(['testFeature1', 'testFeature2'])).resolves.toBe(hotFeatureStates)
  })

  it('should return hot data if it doesn\'t exist', async () => {
    mockIsFeatureFresh.mockImplementation(() => false)
    mockGetFeaturesStatesStale.mockImplementation(() => [])

    await expect(getFeatureStates(['testFeature1', 'testFeature2'])).resolves.toBe(hotFeatureStates)
  })
})
