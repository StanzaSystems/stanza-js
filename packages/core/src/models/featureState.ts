export interface FeatureState {
  featureName: string;
  enabledPercent: number;
  messageEnabled?: string;
  messageDisabled?: string;
  lastRefreshTime: number;
}
