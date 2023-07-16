import { status } from '@grpc/grpc-js'
import { isStatusObject } from './isStatusObject'

export const isTokenInvalidError = (error: unknown) => {
  return isStatusObject(error) &&
    (
      error.code === status.UNAUTHENTICATED ||
      (
        error.code === status.UNKNOWN &&
        (
          error.details.startsWith('failed to verify token') ||
          error.details.startsWith('invalid authorization header format')
        )
      )
    )
}
