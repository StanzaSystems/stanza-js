const FEATURE_HEADER_KEY = 'stz-feat'

function withStanzaHeaders (options: { feature: string }): Record<string, string>
function withStanzaHeaders<H extends HeadersInit = Record<string, string>> ({ feature }: { feature: string }, headers: H): H
function withStanzaHeaders ({ feature }: { feature: string }, headers?: HeadersInit): HeadersInit {
  // @ts-expect-error: if we don't pass initial headers we return Record<string, string> object
  let initHeaders: H = headers ?? {}

  const [headerKey, headerValue] = [FEATURE_HEADER_KEY, feature] as const
  if (initHeaders instanceof Headers) {
    initHeaders = new Headers(initHeaders)
    initHeaders.append(headerKey, headerValue)
  } else if (Array.isArray(initHeaders)) {
    initHeaders = initHeaders.map(h => [...h])
    initHeaders.push([headerKey, headerValue])
  } else {
    initHeaders = { ...initHeaders }
    initHeaders[headerKey] = headerValue
  }

  return initHeaders
}

export {
  withStanzaHeaders
}
