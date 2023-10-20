import { eventDataToRequestAttributes, type RequestAttributes } from './requestAttributes'
import { type ReasonData, type GuardData, type DefaultContextData, type FeatureData } from '../../global/eventBus'

export type GuardResolutionReason = 'fail_open' | 'dark_launch' | 'quota' | 'system_load' | 'circuit_breaking' | 'bulkhead' | 'throttling'

export type GuardResolutionAttributes = RequestAttributes & { reason: GuardResolutionReason }

export const eventDataToGuardResolutionAttributes = (data: DefaultContextData & GuardData & FeatureData & ReasonData): GuardResolutionAttributes => ({
  ...eventDataToRequestAttributes(data),
  reason: data.reason
})
