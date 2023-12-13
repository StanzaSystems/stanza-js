import { hubClientGrpc } from './hub-client-grpc';

describe('sdkBase', () => {
  it('should work', () => {
    expect(hubClientGrpc()).toEqual('hub-client-grpc');
  });
});
