import { beforeEach, describe, expect, it, vi } from 'vitest';

// import type Crypto from 'crypto'
import { generateClientId } from './generateClientId';
// import * as crypto from 'crypto'

vi.mock('crypto', async (importOriginal) => {
  const original = await importOriginal<typeof Crypto>();
  return {
    ...original,
    randomUUID: () => mockRandomUUID(),
  };
});

type RandomUUID = Crypto['randomUUID'];
const mockRandomUUID = vi.fn<Parameters<RandomUUID>, ReturnType<RandomUUID>>();

beforeEach(() => {
  mockRandomUUID.mockReset();
});
describe('generateClientId', function () {
  it('should generate client id', function () {
    mockRandomUUID.mockImplementation(() => 'test-uuid-a-b-c');

    expect(generateClientId()).toEqual('test-uuid-a-b-c');
  });

  it('should return empty string if crypto.randomUUID throws', function () {
    mockRandomUUID.mockImplementationOnce(() => {
      throw new Error('kaboom');
    });
    expect(generateClientId()).toEqual('');
  });
});
