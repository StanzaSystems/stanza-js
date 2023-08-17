import { describe, expect, it } from 'vitest'
import { isStatusObject } from './isStatusObject'
import { Metadata, status } from '@grpc/grpc-js'

describe('isStatusObject', () => {
  it.each([
    null, undefined, {}, 1, 'hello',
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
    expect(isStatusObject(obj)).toBe(false)
  })

  it.each([
    Object.assign(Error('boo'), { code: status.UNKNOWN, details: 'some details of unknown error', metadata: new Metadata() }),
    Object.assign(Error('boo'), { code: status.UNAUTHENTICATED, details: 'unauthenticated request', metadata: new Metadata() })
  ])('should return true for status object: %j', (obj) => {
    expect(isStatusObject(obj)).toBe(true)
  })
})
