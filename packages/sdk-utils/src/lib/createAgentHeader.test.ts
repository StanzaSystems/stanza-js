import { createUserAgentHeader } from './userAgentHeader';

describe('createUserAgentHeader', () => {
  it('should create a proper agent header', () => {
    expect(
      createUserAgentHeader({
        serviceName: 'TestService',
        serviceRelease: '1.2.3',
        sdkName: 'StanzaTestSDK',
        sdkVersion: '4.5.6',
      })
    ).toBe('TestService/1.2.3 StanzaTestSDK/4.5.6');
  });
});
