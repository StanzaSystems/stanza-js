export const isTokenInvalidError = (error: Error | undefined) => {
  return error !== undefined && 'code' in error && error.code === 401;
};
