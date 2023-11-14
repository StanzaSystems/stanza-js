import { type GuardConfigResponse } from './api/guardConfigResponse'
import { type ServiceConfigResponse } from './api/serviceConfigResponse'
import { type StanzaTokenResponse } from './api/stanzaTokenResponse'

type DataSent<T extends { configDataSent: boolean }> = T extends {
  configDataSent: true
}
  ? T
  : never

export type ServiceConfig = Pick<
  DataSent<ServiceConfigResponse>,
  'version' | 'config'
>
export type GuardConfig = Pick<
  DataSent<GuardConfigResponse>,
  'version' | 'config'
>
export type StanzaToken = StanzaTokenResponse
export interface StanzaTokenLease {
  feature: string
  priorityBoost: number
  token: string
  expiresAt: number
}
export type StanzaTokenLeasesResult =
  | {
      granted: true
      leases: StanzaTokenLease[]
    }
  | {
      granted: false
    }
export interface ValidatedToken {
  token: string
  valid: boolean
}

export interface AuthTokenResult {
  bearerToken: string
}
