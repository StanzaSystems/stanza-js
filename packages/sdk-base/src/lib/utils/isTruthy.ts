export const isTruthy = <T>(v: T): v is NonNullable<T> & Exclude<T, false> =>
  Boolean(v);
