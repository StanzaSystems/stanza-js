import {
  type DecoratorConfig,
  type ServiceConfig,
  type StanzaToken,
  type StanzaTokenLeasesResult,
  type ValidatedToken
} from './model'

export interface FetchServiceConfigOptions {
  lastVersionSeen?: string
}

export interface FetchDecoratorConfigOptions {
  decorator: string
  lastVersionSeen?: string
}

export interface Tag {
  key: string
  value: string
}

interface GetTokenOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

interface GetTokenLeaseOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
  tags?: Tag[]
}

interface ValidateTokenOptions {
  decorator: string
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
  fetchDecoratorConfig: (options: FetchDecoratorConfigOptions) => Promise<DecoratorConfig | null>
  getToken: (options: GetTokenOptions) => Promise<StanzaToken | null>
  getTokenLease: (options: GetTokenLeaseOptions) => Promise<StanzaTokenLeasesResult | null>
  validateToken: (options: ValidateTokenOptions) => Promise<ValidatedToken | null>
  markTokensAsConsumed: (options: MarkTokensAsConsumedOptions) => Promise<{ ok: boolean } | null>
  getAuthToken: () => Promise<string | null>
}
