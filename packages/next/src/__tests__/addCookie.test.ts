import { describe, expect, it } from 'vitest';
import { addCookie } from '../addCookie';

describe('addCookie', () => {
  it('should create cookie if it did not exist', () => {
    expect(addCookie(undefined, 'testCookie')).toEqual('testCookie');
  });

  it('should append a cookie if one already exists - string', () => {
    expect(addCookie('existingCookie', 'testCookie')).toEqual([
      'existingCookie',
      'testCookie',
    ]);
  });

  it('should append a cookie if one already exists - number', () => {
    expect(addCookie(123, 'testCookie')).toEqual(['123', 'testCookie']);
  });

  it('should append a cookie if more than one already exists', () => {
    expect(
      addCookie(['existingCookie1', 'existingCookie2'], 'testCookie')
    ).toEqual(['existingCookie1', 'existingCookie2', 'testCookie']);
  });

  it('should create an empty cookie if it did not exist', () => {
    expect(addCookie(undefined, '')).toEqual('');
  });

  it('should NOT append an empty cookie if one already exists - string', () => {
    expect(addCookie('existingCookie', '')).toEqual('existingCookie');
  });

  it('should NOT append an empty cookie if one already exists - number', () => {
    expect(addCookie(123, '')).toEqual(123);
  });

  it('should NOT append an empty cookie if more than one already exists', () => {
    expect(addCookie(['existingCookie1', 'existingCookie2'], '')).toEqual([
      'existingCookie1',
      'existingCookie2',
    ]);
  });
});
