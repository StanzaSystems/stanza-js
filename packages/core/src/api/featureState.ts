export interface ApiFeatureState {
  name: string
  config: {
    enabledPercent: number
    actionCodeEnabled?: number
    messageEnabled?: string
    actionCodeDisabled?: number
    messageDisabled?: string
  }
}
