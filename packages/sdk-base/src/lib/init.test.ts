import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from './init';
import { type StanzaInitOptions } from './stanzaInitOptions';
import type { getEnvInitOptions as getEnvInitOptionsType } from './getEnvInitOptions';
import { logger } from './global/logger';
import { mockHubService } from './__tests__/mocks/mockHubService';

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

const getEnvInitOptionsMock = vi.fn();
const fetchMock = vi.fn();
const createHubService = () => mockHubService;

beforeEach(async () => {
  const { getEnvInitOptions } = await vi.importActual<{
    getEnvInitOptions: typeof getEnvInitOptionsType;
  }>('./getEnvInitOptions');
  getEnvInitOptionsMock.mockImplementation(getEnvInitOptions);
});

afterEach(() => {
  getEnvInitOptionsMock.mockReset();
  fetchMock.mockReset();
});

describe('Stanza init', function () {
  describe('invalid options', () => {
    it('should not throw when not options provided', async () => {
      await expect(init({ createHubService })).resolves.toBeUndefined();
    });

    it('should warn if empty config is provided', async () => {
      const warnSpy = vi.spyOn(logger, 'warn');

      await init({ createHubService });

      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy)
        .toHaveBeenCalledWith(`Provided options are invalid. Please provide an object with the following properties:
- hubUrl: string (URL to a Hub instance)
- apiKey: string (API key for a Hub instance)
- serviceName: string (Name of the service)
- serviceRelease: string (A version of the service)
- sdkName: string (Name of the SDK)
- sdkVersion: string (A version of the SDK)
- environment: string (An environment to use)`);
    });
  });

  describe('valid options', () => {
    it(
      'should not throw when valid options provided',
      async () => {
        await expect(
          init({
            createHubService,
            hubUrl: 'https://url.to.stanza.hub',
            apiKey: 'dummyAPIKey',
            serviceName: 'dummyStanzaService',
            serviceRelease: 'dummyStanzaRelease',
            environment: 'testEnvironment',
          })
        ).resolves.toBeUndefined();
      },
      {
        // first init takes longer due to dynamic imports in addInstrumentation.ts
        timeout: 10000,
      }
    );

    it('should not warn if valid config is provided', async () => {
      const warnSpy = vi.spyOn(logger, 'warn');
      fetchMock.mockImplementation(async () => ({
        json: async () => ({}),
      }));
      await init({
        createHubService,
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment',
      });

      expect(warnSpy).not.toHaveBeenCalledWith('Provided options are invalid');

      vi.unstubAllGlobals();
    });

    it('should not warn for empty config if env variables are set', async () => {
      const warnSpy = vi.spyOn(logger, 'warn');
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

      await init({ createHubService });

      expect(warnSpy).not.toHaveBeenCalledWith('Provided options are invalid');
    });
  });
});
