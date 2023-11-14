import { getConfig } from '../globals'

export function isFeatureStateFresh(featureState: {
  lastRefreshTime: number
}): boolean {
  const lastRefreshTime = featureState.lastRefreshTime
  return (
    lastRefreshTime !== undefined &&
    Date.now() - lastRefreshTime < (getConfig().refreshSeconds ?? 30) * 1000
  )
}
