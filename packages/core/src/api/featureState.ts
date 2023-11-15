export interface ApiFeatureState {
  name: string;
  config: {
    enabledPercent: number;
    messageEnabled?: string;
    messageDisabled?: string;
  };
}
