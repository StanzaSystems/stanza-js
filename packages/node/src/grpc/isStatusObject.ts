// import { type StatusObject, Metadata, status } from '@grpc/grpc-js';

export const isStatusObject = (_error: unknown)/* : error is StatusObject */ => {
  return false;
  // return (
  //   error instanceof Error &&
  //   'code' in error &&
  //   typeof error.code === 'number' &&
  //   error.code in status &&
  //   'details' in error &&
  //   typeof error.details === 'string' &&
  //   'metadata' in error &&
  //   error.metadata instanceof Metadata
  // );
};
