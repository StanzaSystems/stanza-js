import { type StanzaTokenLease, type StanzaTokenLeases } from '../hub/model'

export interface TokenQuery {
  feature?: string
  priorityBoost?: number
}

export type AvailableRatioListenerFn = (ratioAvailable: number) => void

export interface AvailableRatioListener {
  listener: AvailableRatioListenerFn
  expiresOffset: number
}
export interface TokenState {
  addTokens: (leases: StanzaTokenLeases) => void
  hasToken: (query?: TokenQuery) => boolean
  popToken: (query?: TokenQuery) => StanzaTokenLease | null
  onTokensAvailableRatioChange: (expiresOffset: number, listener: AvailableRatioListenerFn) => void
}
