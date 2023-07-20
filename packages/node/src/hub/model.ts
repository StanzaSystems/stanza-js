import { type DecoratorConfigResponse } from './api/decoratorConfigResponse'
import { type ServiceConfigResponse } from './api/serviceConfigResponse'
import { type StanzaTokenResponse } from './api/stanzaTokenResponse'

type DataSent<T extends { configDataSent: boolean }> = T extends { configDataSent: true } ? T : never

export type ServiceConfig = Pick<DataSent<ServiceConfigResponse>, 'version' | 'config'>
export type DecoratorConfig = Pick<DataSent<DecoratorConfigResponse>, 'version' | 'config'>
export type StanzaToken = StanzaTokenResponse
export interface StanzaTokenLease {
  feature: string
  priorityBoost: number
  token: string
  expiresAt: number
}
export type StanzaTokenLeasesResult = {
  granted: true
  leases: StanzaTokenLease[]
} | {
  granted: false
}
export interface ValidatedToken {
  token: string
  valid: boolean
}

export interface AuthTokenResult {
  bearerToken: string
}
