import {
  eventDataToRequestAttributes,
  type RequestAttributes
} from './requestAttributes'
import type {
  ReasonData,
  GuardData,
  DefaultContextData,
  FeatureData,
  ConfigState,
  LocalReason,
  TokenReason,
  QuotaReason
} from '../../global/eventBus'

export type GuardResolutionAttributes = RequestAttributes & {
  config_state: ConfigState
  local_reason: LocalReason
  token_reason: TokenReason
  quota_reason: QuotaReason
}

export const eventDataToGuardResolutionAttributes = (
  data: DefaultContextData & GuardData & FeatureData & ReasonData
): GuardResolutionAttributes => ({
  ...eventDataToRequestAttributes(data),
  config_state: data.configState,
  local_reason: data.localReason,
  token_reason: data.tokenReason,
  quota_reason: data.quotaReason
})
