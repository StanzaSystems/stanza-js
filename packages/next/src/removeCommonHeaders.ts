export function removeCommonHeaders(
  targetHeaders: Headers,
  headersToRemove: Headers
): Headers {
  const result = new Headers(targetHeaders);
  headersToRemove.forEach((value, key) => {
    if (result.has(key)) {
      result.delete(key);
    }
  });
  return result;
}
