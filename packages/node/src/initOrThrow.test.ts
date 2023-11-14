import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initOrThrow } from './initOrThrow';
import { type StanzaInitOptions } from './stanzaInitOptions';
import type { getEnvInitOptions as getEnvInitOptionsType } from './getEnvInitOptions';
import * as createGrpcHubServiceModule from './hub/grpc/createGrpcHubService';
import * as createRestHubServiceModule from './hub/rest/createRestHubService';

vi.mock('./getEnvInitOptions', () => {
  return {
    getEnvInitOptions: (): StanzaInitOptions => {
      return getEnvInitOptionsMock();
    },
  };
});
vi.mock('./fetchImplementation', () => {
  return {
    fetch: ((...args) => fetchMock(...args)) satisfies typeof fetch,
  };
});

vi.mock('./global/logger', async () => {
  const pino = (await import('pino')).pino;
  return {
    logger: Object.assign(pino({}), {
      wrap: <T>(_: unknown, v: T) => v,
    }),
  };
});

const createGrpcHubServiceMock = vi.spyOn(
  createGrpcHubServiceModule,
  'createGrpcHubService',
);
const createRestHubServiceMock = vi.spyOn(
  createRestHubServiceModule,
  'createRestHubService',
);

const getEnvInitOptionsMock = vi.fn();
const fetchMock = vi.fn();

beforeEach(async () => {
  const { getEnvInitOptions } = await vi.importActual<{
    getEnvInitOptions: typeof getEnvInitOptionsType;
  }>('./getEnvInitOptions');
  getEnvInitOptionsMock.mockImplementation(getEnvInitOptions);
  createGrpcHubServiceMock.mockReset();
  createRestHubServiceMock.mockReset();
});

afterEach(() => {
  getEnvInitOptionsMock.mockReset();
  fetchMock.mockReset();
});

describe('Stanza init', function () {
  describe('invalid options', () => {
    it('should throw when not options provided', async () => {
      await expect(initOrThrow()).rejects.toEqual(
        new Error(`Provided options are invalid. Please provide an object with the following properties:
- hubUrl: string (URL to a Hub instance)
- apiKey: string (API key for a Hub instance)
- serviceName: string (Name of the service)
- serviceRelease: string (A version of the service)
- environment: string (An environment to use)`),
      );
    });

    it('should warn if empty config is provided', async () => {
      await expect(initOrThrow()).rejects.toEqual(
        new Error(`Provided options are invalid. Please provide an object with the following properties:
- hubUrl: string (URL to a Hub instance)
- apiKey: string (API key for a Hub instance)
- serviceName: string (Name of the service)
- serviceRelease: string (A version of the service)
- environment: string (An environment to use)`),
      );
    });
  });

  describe('valid options', () => {
    it(
      'should resolve when valid options provided',
      async () => {
        fetchMock.mockImplementation(async () => ({
          json: async () => ({}),
        }));
        await expect(
          initOrThrow({
            hubUrl: 'https://url.to.stanza.hub',
            apiKey: 'dummyAPIKey',
            serviceName: 'dummyStanzaService',
            serviceRelease: 'dummyStanzaRelease',
            environment: 'testEnvironment',
          }),
        ).resolves.toBeUndefined();
      },
      {
        // first init takes longer due to dynamic imports in addInstrumentation.ts
        timeout: 10000,
      },
    );

    it('should resolve if valid config is provided', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({}),
      }));
      await expect(
        initOrThrow({
          hubUrl: 'https://url.to.stanza.hub',
          apiKey: 'dummyAPIKey',
          serviceName: 'dummyStanzaService',
          serviceRelease: 'dummyStanzaRelease',
          environment: 'testEnvironment',
        }),
      ).resolves.toBeUndefined();
    });

    it('should resolve for empty config if env variables are set', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({}),
      }));
      getEnvInitOptionsMock.mockImplementation(() => {
        return {
          hubUrl: 'https://url.to.stanza.hub',
          apiKey: 'dummyAPIKey',
          serviceName: 'dummyStanzaService',
          serviceRelease: 'dummyStanzaRelease',
          environment: 'testEnvironment',
        };
      });

      await expect(initOrThrow()).resolves.toBeUndefined();
    });

    it('should create grpc hub service by default', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({}),
      }));
      await expect(
        initOrThrow({
          hubUrl: 'https://url.to.stanza.hub',
          apiKey: 'dummyAPIKey',
          serviceName: 'dummyStanzaService',
          serviceRelease: 'dummyStanzaRelease',
          environment: 'testEnvironment',
        }),
      ).resolves.toBeUndefined();

      expect(createGrpcHubServiceMock).toHaveBeenCalledOnce();
      expect(createRestHubServiceMock).not.toHaveBeenCalled();
    });

    it('should create rest hub service is useRest is specified', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({}),
      }));
      await expect(
        initOrThrow({
          hubUrl: 'https://url.to.stanza.hub',
          apiKey: 'dummyAPIKey',
          serviceName: 'dummyStanzaService',
          serviceRelease: 'dummyStanzaRelease',
          environment: 'testEnvironment',
          useRestHubApi: true,
        }),
      ).resolves.toBeUndefined();

      expect(createRestHubServiceMock).toHaveBeenCalled();
      expect(createGrpcHubServiceMock).not.toHaveBeenCalledOnce();
    });
  });
});
