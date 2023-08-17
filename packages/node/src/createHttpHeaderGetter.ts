import { type ClientRequest, IncomingMessage, type ServerResponse } from 'http'
import { type HeaderGetter } from './span/SpanEnhancer'

export const createHttpHeaderGetter = (requestOrResponse: IncomingMessage | ClientRequest | ServerResponse): HeaderGetter => (headerName) =>
  requestOrResponse instanceof IncomingMessage
    ? requestOrResponse.headers[headerName]
    : requestOrResponse.getHeader(headerName)
