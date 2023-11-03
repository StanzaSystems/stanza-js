export function removeCommonHeaders (firstHeaders: Headers, secondHeaders: Headers): Headers {
  const result = new Headers(firstHeaders)
  secondHeaders.forEach((value, key) => {
    if (result.has(key)) {
      result.delete(key)
    } else {
      result.set(key, value)
    }
  })
  return result
}
