const BAGGAGE_HEADER = 'baggage';
const FEATURE_BAGGAGE_KEY = 'stz-feat';

function withStanzaHeaders(options: {
  feature: string;
}): Record<string, string>;
function withStanzaHeaders<H extends HeadersInit = Record<string, string>>(
  { feature }: { feature: string },
  headers: H,
): H;
function withStanzaHeaders(
  { feature }: { feature: string },
  headers?: HeadersInit,
): HeadersInit {
  // @ts-expect-error: if we don't pass initial headers we return Record<string, string> object
  let initHeaders: H = headers ?? {};

  const baggageValue = `${FEATURE_BAGGAGE_KEY}=${feature}`;
  if (initHeaders instanceof Headers) {
    initHeaders = new Headers(initHeaders);
    initHeaders.append(BAGGAGE_HEADER, baggageValue);
  } else if (Array.isArray(initHeaders)) {
    initHeaders = initHeaders.map((h) => [...h]);
    initHeaders.push([BAGGAGE_HEADER, baggageValue]);
  } else {
    initHeaders = { ...initHeaders };
    initHeaders[BAGGAGE_HEADER] = baggageValue;
  }

  return initHeaders;
}

export { withStanzaHeaders };
