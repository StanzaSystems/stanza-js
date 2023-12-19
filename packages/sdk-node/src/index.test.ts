import { initOrThrow } from './index';

import * as createGrpcHubServiceModule from '@getstanza/hub-client-grpc';
import * as createRestHubServiceModule from '@getstanza/hub-client-http';
import { expect } from 'vitest';

const createGrpcHubServiceMock = vi.spyOn(
  createGrpcHubServiceModule,
  'createGrpcHubService'
);
const createRestHubServiceMock = vi.spyOn(
  createRestHubServiceModule,
  'createRestHubService'
);

vi.spyOn(createRestHubServiceModule, 'createHubRequest').mockImplementation(
  () => async () => Promise.resolve(null)
);

beforeEach(() => {
  createGrpcHubServiceMock.mockClear();
  createRestHubServiceMock.mockClear();
});

describe('index', () => {
  it('should create grpc hub service by default', async () => {
    await expect(
      initOrThrow({
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment',
      })
    ).resolves.toBeUndefined();

    expect(createGrpcHubServiceMock).toHaveBeenCalledOnce();
    expect(createRestHubServiceMock).not.toHaveBeenCalled();
  });

  it('should create rest hub service is useRest is specified', async () => {
    await expect(
      initOrThrow({
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment',
        useRestHubApi: true,
      })
    ).resolves.toBeUndefined();

    expect(createRestHubServiceMock).toHaveBeenCalled();
    expect(createGrpcHubServiceMock).not.toHaveBeenCalledOnce();
  });
});
