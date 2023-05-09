import { type DecoratorConfig, type ServiceConfig, type StanzaToken, type ValidatedToken, type StanzaTokenLeasesResult } from './model'

export interface FetchServiceConfigOptions {
  lastVersionSeen?: string
}

export interface FetchDecoratorConfigOptions {
  decorator: string
  lastVersionSeen?: string
}

interface GetTokenOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

interface GetTokenLeaseOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

interface ValidateTokenOptions {
  decorator: string
  token: string
}

export interface HubService {
  fetchServiceConfig: (options?: FetchServiceConfigOptions) => Promise<ServiceConfig | null>
  fetchDecoratorConfig: (options: FetchDecoratorConfigOptions) => Promise<DecoratorConfig | null>
  getToken: (options: GetTokenOptions) => Promise<StanzaToken | null>
  getTokenLease: (options: GetTokenLeaseOptions) => Promise<StanzaTokenLeasesResult | null>
  validateToken: (options: ValidateTokenOptions) => Promise<ValidatedToken | null>
}
