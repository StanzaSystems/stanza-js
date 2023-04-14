export const isTruthy = <T>(v: T): v is NonNullable<T> => Boolean(v)
