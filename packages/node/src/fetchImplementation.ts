import nodeFetch from 'node-fetch'

export const fetch = globalThis.fetch ?? nodeFetch
