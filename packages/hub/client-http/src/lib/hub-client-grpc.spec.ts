import { hubClientHttp } from './hub-client-http';

describe('sdkBase', () => {
  it('should work', () => {
    expect(hubClientHttp()).toEqual('hub-client-http');
  });
});
