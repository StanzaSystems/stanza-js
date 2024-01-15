import { type Mock, vi } from 'vitest';
import { updateHubService } from '../../global/hubService';
import { type HubService } from '@getstanza/hub-client-api';

const hubServiceMockMethod = <TMethod extends keyof HubService>(
  implementation: (
    ...args: Parameters<HubService[TMethod]>
  ) => ReturnType<HubService[TMethod]>
) =>
  Object.assign(
    vi.fn<Parameters<HubService[TMethod]>, ReturnType<HubService[TMethod]>>(
      implementation
    ),
    {
      mockImplementationDeferred: function (
        this: Mock<
          Parameters<HubService[TMethod]>,
          ReturnType<HubService[TMethod]>
        >
      ) {
        const deferred: {
          resolve: (value: Awaited<ReturnType<HubService[TMethod]>>) => void;
          reject: (reason: unknown) => void;
        } = {
          resolve: () => {},
          reject: () => {},
        };
        this.mockImplementation((): any => {
          return new Promise<ReturnType<HubService[TMethod]>>(
            (resolve, reject) => {
              deferred.resolve = resolve;
              deferred.reject = reject;
            }
          );
        });

        return deferred;
      },
    }
  );

const getServiceMetadataMock = hubServiceMockMethod<'getServiceMetadata'>(
  () => ({
    serviceName: 'mockService',
    serviceRelease: '1.0.0',
    environment: 'mockEnvironment',
    clientId: 'mockClientId',
  })
);
const fetchServiceConfigMock = hubServiceMockMethod<'fetchServiceConfig'>(
  async () => new Promise<never>(() => {})
);
const fetchGuardConfigMock = hubServiceMockMethod<'fetchGuardConfig'>(
  async () => new Promise<never>(() => {})
);
const getTokenMock = hubServiceMockMethod<'getToken'>(
  async () => new Promise<never>(() => {})
);
const getTokenLeaseMock = hubServiceMockMethod<'getTokenLease'>(
  async () => new Promise<never>(() => {})
);
const validateTokenMock = hubServiceMockMethod<'validateToken'>(
  async () => new Promise<never>(() => {})
);
const markTokensAsConsumedMock = hubServiceMockMethod<'markTokensAsConsumed'>(
  async () => new Promise<never>(() => {})
);
const getAuthTokenMock = hubServiceMockMethod<'getAuthToken'>(
  async () => new Promise<never>(() => {})
);
const getGuardHealthMock = hubServiceMockMethod<'getGuardHealth'>(
  async () => new Promise<never>(() => {})
);

export const mockHubService = {
  getServiceMetadata: getServiceMetadataMock,
  fetchServiceConfig: fetchServiceConfigMock,
  fetchGuardConfig: fetchGuardConfigMock,
  getToken: getTokenMock,
  getTokenLease: getTokenLeaseMock,
  validateToken: validateTokenMock,
  markTokensAsConsumed: markTokensAsConsumedMock,
  getAuthToken: getAuthTokenMock,
  getGuardHealth: getGuardHealthMock,
  reset: () => {
    getServiceMetadataMock.mockRestore();
    fetchServiceConfigMock.mockRestore();
    fetchGuardConfigMock.mockRestore();
    getTokenMock.mockRestore();
    getTokenLeaseMock.mockRestore();
    validateTokenMock.mockRestore();
    markTokensAsConsumedMock.mockRestore();
    getAuthTokenMock.mockRestore();

    updateHubService(mockHubService);
  },
} satisfies HubService & { reset: () => void };
