import {
  type GuardConfig,
  type ServiceConfig,
  type StanzaToken,
  type StanzaTokenLeasesResult,
  type ValidatedToken
} from './model'

export interface FetchServiceConfigOptions {
  lastVersionSeen?: string
}

export interface FetchGuardConfigOptions {
  guard: string
  lastVersionSeen?: string
}

export interface Tag {
  key: string
  value: string
}

interface GetTokenOptions {
  guard: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

interface GetTokenLeaseOptions {
  guard: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

interface ValidateTokenOptions {
  guard: string
  token: string
}

interface MarkTokensAsConsumedOptions {
  tokens: string[]
}

export interface HubService {
  getServiceMetadata: () => {
    serviceName: string
    environment: string
    clientId: string
  }
  fetchServiceConfig: (options?: FetchServiceConfigOptions) => Promise<ServiceConfig | null>
  fetchGuardConfig: (options: FetchGuardConfigOptions) => Promise<GuardConfig | null>
  getToken: (options: GetTokenOptions) => Promise<StanzaToken | null>
  getTokenLease: (options: GetTokenLeaseOptions) => Promise<StanzaTokenLeasesResult | null>
  validateToken: (options: ValidateTokenOptions) => Promise<ValidatedToken | null>
  markTokensAsConsumed: (options: MarkTokensAsConsumedOptions) => Promise<{ ok: boolean } | null>
  getAuthToken: () => Promise<{ token: string } | null>
}
