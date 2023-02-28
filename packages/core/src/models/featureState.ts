export interface FeatureState {
  featureName: string
  enabledPercent: number
  actionCodeEnabled?: number
  messageEnabled?: string
  actionCodeDisabled?: number
  messageDisabled?: string
  lastRefreshTime: number
}
