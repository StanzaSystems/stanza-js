import { hubClientApi } from './hub-client-api';

describe('sdkBase', () => {
  it('should work', () => {
    expect(hubClientApi()).toEqual('hub-client-api');
  });
});
