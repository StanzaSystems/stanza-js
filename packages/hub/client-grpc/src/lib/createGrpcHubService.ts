import {
  apiHealthToHealth,
  guardConfigResponse,
  Health,
  type HubService,
  type ServiceConfig,
  serviceConfigResponse,
  stanzaAuthTokenResponse,
  stanzaGuardHealthResponse,
  stanzaMarkTokensAsConsumedResponse,
  stanzaTokenLeaseResponse,
  stanzaTokenResponse,
  stanzaValidateTokenResponse,
} from '@getstanza/hub-client-api';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { createUserAgentHeader, withTimeout } from '@getstanza/sdk-utils';
import { createPromiseClient } from '@connectrpc/connect';
import { ConfigService } from '../gen/stanza/hub/v1/config_connect';
import { QuotaService } from '../gen/stanza/hub/v1/quota_connect';
import { AuthService } from '../gen/stanza/hub/v1/auth_connect';
import { HealthService } from '../gen/stanza/hub/v1/health_connect';
import type { z, ZodType } from 'zod';
import type pino from 'pino';

export interface GrpcHubServiceInitOptions {
  serviceName: string;
  serviceRelease: string;
  sdkName: string;
  sdkVersion: string;
  environment: string;
  clientId: string;
  hubUrl: string;
  apiKey: string;
  logger: pino.Logger;
  getRequestTimeout: () => number;
}

export function createGrpcHubService({
  serviceName,
  serviceRelease,
  sdkName,
  sdkVersion,
  environment,
  clientId,
  hubUrl,
  apiKey,
  logger,
  getRequestTimeout,
}: GrpcHubServiceInitOptions): HubService {
  const transport = createGrpcTransport({
    baseUrl: hubUrl,
    httpVersion: '2',
    interceptors: [
      (next) => async (req) => {
        req.header.set('X-Stanza-Key', apiKey);
        req.header.set(
          'User-Agent',
          createUserAgentHeader({
            serviceName,
            serviceRelease,
            sdkName,
            sdkVersion,
          })
        );
        return next(req);
      },
    ],
  });
  const configClient = createPromiseClient(ConfigService, transport);
  const quotaClient = createPromiseClient(QuotaService, transport);
  const authClient = createPromiseClient(AuthService, transport);
  const healthClient = createPromiseClient(HealthService, transport);
  return {
    getServiceMetadata: () => ({
      serviceName,
      serviceRelease,
      environment,
      clientId,
    }),
    fetchServiceConfig: async (options): Promise<ServiceConfig | null> => {
      const data = await grpcRequest(
        async () =>
          configClient.getServiceConfig({
            service: {
              name: serviceName,
              environment,
              release: serviceRelease,
            },
            versionSeen: options?.lastVersionSeen,
            clientId: options?.clientId,
          }),
        serviceConfigResponse
      );

      if (data === null || !data.configDataSent) {
        return null;
      }

      return {
        config: data.config,
        version: data.version,
      };
    },
    fetchGuardConfig: async (options) => {
      const data = await grpcRequest(
        async () =>
          configClient.getGuardConfig({
            selector: {
              serviceName,
              serviceRelease,
              environment,
              guardName: options.guard,
            },
            versionSeen: options.lastVersionSeen,
          }),
        guardConfigResponse
      );

      if (data === null || !data.configDataSent) {
        return null;
      }

      return {
        config: data.config,
        version: data.version,
      };
    },
    getToken: async (options) => {
      return grpcRequest(
        async () =>
          quotaClient.getToken({
            clientId,
            priorityBoost: options.priorityBoost,
            selector: {
              featureName: options.feature,
              guardName: options.guard,
              environment,
              tags: options.tags,
            },
          }),
        stanzaTokenResponse
      );
    },
    getTokenLease: async (options) => {
      const data = await grpcRequest(
        async () =>
          quotaClient.getTokenLease({
            clientId,
            priorityBoost: options.priorityBoost,
            selector: {
              featureName: options.feature,
              guardName: options.guard,
              environment,
              tags: options.tags,
            },
          }),
        stanzaTokenLeaseResponse
      );

      if (data === null) {
        return null;
      }

      const now = Date.now();

      if (data.leases.length === 0) {
        return { granted: false };
      }

      return {
        granted: true,
        leases: data.leases.map((lease) => ({
          token: lease.token,
          feature: lease.feature,
          priorityBoost: lease.priorityBoost,
          expiresAt: now + lease.durationMsec,
        })),
      };
    },
    validateToken: async (options) => {
      const data = await grpcRequest(
        async () =>
          quotaClient.validateToken({
            tokens: [
              {
                token: options.token,
                guard: {
                  name: options.guard,
                  environment,
                },
              },
            ],
          }),
        stanzaValidateTokenResponse
      );

      return data?.tokensValid?.[0] ?? null;
    },
    markTokensAsConsumed: async (options) => {
      const data = await grpcRequest(
        async () =>
          quotaClient.setTokenLeaseConsumed({
            environment,
            tokens: options.tokens,
          }),
        stanzaMarkTokensAsConsumedResponse
      );

      return data === null ? null : { ok: true };
    },
    getAuthToken: async () => {
      const data = await grpcRequest(
        async () =>
          authClient.getBearerToken({
            environment,
          }),
        stanzaAuthTokenResponse
      );

      return data === null ? null : { token: data.bearerToken };
    },
    getGuardHealth: async (options) => {
      const data = await grpcRequest(
        async () =>
          healthClient.queryGuardHealth({
            selector: {
              guardName: options.guard,
              featureName: options.feature,
              environment: options.environment,
              tags: options.tags,
            },
          }),
        stanzaGuardHealthResponse
      );

      return data !== null
        ? apiHealthToHealth(data.health)
        : Health.Unspecified;
    },
  };

  async function grpcRequest<T extends ZodType>(
    req: () => Promise<unknown>,
    validateResult: T
  ): Promise<z.infer<T> | null> {
    const response = await withTimeout(
      getRequestTimeout(),
      'Hub request timed out',
      req()
    );

    const parsed = validateResult.safeParse(response);

    if (!parsed.success) {
      logger.debug('grpc request to hub failed %o', parsed.error);
      logger.debug('raw response: %o', response);
      return null;
    }

    return parsed.data;
  }
}
