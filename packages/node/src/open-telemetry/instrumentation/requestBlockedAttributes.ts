import { eventDataToRequestAttributes, type RequestAttributes } from './requestAttributes'
import { type BlockedReasonData, type GuardData, type DefaultContextData, type FeatureData } from '../../global/eventBus'

export type BlockedReason = 'quota' | 'system_load' | 'circuit_breaking' | 'bulkhead' | 'throttling'

export type RequestBlockedAttributes = RequestAttributes & { reason: BlockedReason }

export const eventDataToRequestBlockedAttributes = (data: DefaultContextData & GuardData & FeatureData & BlockedReasonData): RequestBlockedAttributes => ({
  ...eventDataToRequestAttributes(data),
  reason: data.reason
})
