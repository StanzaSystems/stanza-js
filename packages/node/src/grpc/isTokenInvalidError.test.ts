import { Metadata, status } from '@grpc/grpc-js'
import { describe, expect, it } from 'vitest'
import { isTokenInvalidError } from './isTokenInvalidError'

describe('isTokenInvalidError', () => {
  it.each([null, undefined, {}, 1, 'hello',
    Error('boo'),
    // not all required props provided
    Object.assign(Error('boo'), { code: status.UNKNOWN }),
    Object.assign(Error('boo'), { details: 'some detail' }),
    Object.assign(Error('boo'), { metadata: new Metadata() }),
    // one of props has wrong type
    Object.assign(Error('boo'), { code: '2', details: 'some details', metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: true, metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: 'some details', metadata: { foo: 'not metadata' } }),
    // code is not one of status enum possible values
    Object.assign(Error('boo'), { code: -1, details: true, metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: 17, details: true, metadata: new Metadata() })
  ])('should return false for non status object: %j', (obj) => {
    expect(isTokenInvalidError(obj)).toBe(false)
  })

  it.each([
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: 'some details of unknown error', metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.CANCELLED, details: 'request cancelled', metadata: new Metadata() })
  ])('should return false for non token related status object: %j', (obj) => {
    expect(isTokenInvalidError(obj)).toBe(false)
  })

  it.each([
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: 'failed to verify token: oidc: malformed jwt: square/go-jose: compact JWS format must have three parts', metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: 'failed to verify token: oidc: malformed jwt: illegal base64 data at input byte 344', metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: 'invalid authorization header format', metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.UNAUTHENTICATED, details: 'request unauthenticated', metadata: new Metadata() })
  ])('should return true for token invalid status object: %j', (obj) => {
    expect(isTokenInvalidError(obj)).toBe(true)
  })
})
