import { eventDataToRequestAttributes, type RequestAttributes } from './requestAttributes'

export type BlockedReason = 'quota' | 'system_load' | 'circuit_breaking' | 'bulkhead' | 'throttling'

export type RequestBlockedAttributes = RequestAttributes & { reason: BlockedReason }

export const eventDataToRequestBlockedAttributes = (data: any): RequestBlockedAttributes => ({
  ...eventDataToRequestAttributes(data),
  reason: data.reason
})
