export function mergeHeaders(...headers: Headers[]): Headers {
  return headers.reduce((combined, nextHeaders) => {
    nextHeaders.forEach((value, key) => {
      combined.set(key, value)
    })
    return combined
  }, new Headers())
}
