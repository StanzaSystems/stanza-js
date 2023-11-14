import {
  eventDataToRequestAttributes,
  type RequestAttributes,
} from './requestAttributes';
import type {
  ConfigState,
  DefaultContextData,
  FeatureData,
  GuardData,
  GuardMode,
  LocalReason,
  QuotaReason,
  ReasonData,
  TokenReason,
} from '../../global/eventBus';

export type GuardResolutionAttributes = RequestAttributes & {
  config_state: ConfigState;
  local_reason: LocalReason;
  token_reason: TokenReason;
  quota_reason: QuotaReason;
  mode: GuardMode;
};

export const eventDataToGuardResolutionAttributes = (
  data: DefaultContextData &
    GuardData &
    FeatureData &
    ReasonData & { mode: GuardMode },
): GuardResolutionAttributes => ({
  ...eventDataToRequestAttributes(data),
  config_state: data.configState,
  local_reason: data.localReason,
  token_reason: data.tokenReason,
  quota_reason: data.quotaReason,
  mode: data.mode,
});
