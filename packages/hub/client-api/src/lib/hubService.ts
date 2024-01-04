import {
  type GuardConfig,
  type Health,
  type ServiceConfig,
  type StanzaToken,
  type StanzaTokenLeasesResult,
  type Tag,
  type ValidatedToken,
} from './model';

export interface FetchServiceConfigOptions {
  lastVersionSeen?: string;
  clientId?: string;
}

export interface FetchGuardConfigOptions {
  guard: string;
  lastVersionSeen?: string;
}

interface GetTokenOptions {
  guard: string;
  feature?: string;
  priorityBoost?: number;
  tags?: Tag[];
}

interface GetTokenLeaseOptions {
  guard: string;
  feature?: string;
  priorityBoost?: number;
  tags?: Tag[];
}

interface ValidateTokenOptions {
  guard: string;
  token: string;
}

interface MarkTokensAsConsumedOptions {
  tokens: string[];
}

interface GetGuardHealthOptions {
  guard: string;
  feature: string;
  environment: string;
  tags?: Tag[];
}

export interface HubService {
  getServiceMetadata: () => {
    serviceName: string;
    serviceRelease: string;
    environment: string;
    clientId: string;
  };
  fetchServiceConfig: (
    options?: FetchServiceConfigOptions
  ) => Promise<ServiceConfig | null>;
  fetchGuardConfig: (
    options: FetchGuardConfigOptions
  ) => Promise<GuardConfig | null>;
  getToken: (options: GetTokenOptions) => Promise<StanzaToken | null>;
  getTokenLease: (
    options: GetTokenLeaseOptions
  ) => Promise<StanzaTokenLeasesResult | null>;
  validateToken: (
    options: ValidateTokenOptions
  ) => Promise<ValidatedToken | null>;
  markTokensAsConsumed: (
    options: MarkTokensAsConsumedOptions
  ) => Promise<{ ok: boolean } | null>;
  getAuthToken: () => Promise<{ token: string } | null>;
  getGuardHealth: (options: GetGuardHealthOptions) => Promise<Health>;
}
