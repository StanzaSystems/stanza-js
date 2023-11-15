import { status, type StatusObject } from '@grpc/grpc-js';
import { isStatusObject } from './isStatusObject';

export const isTokenInvalidError = (error: unknown): error is StatusObject => {
  return (
    isStatusObject(error) &&
    (error.code === status.UNAUTHENTICATED ||
      (error.code === status.UNKNOWN &&
        (error.details.startsWith('failed to verify token') ||
          error.details.startsWith('invalid authorization header'))))
  );
};
