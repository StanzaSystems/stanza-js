if (global.fetch === undefined) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fetch, Headers, Request, Response } = require('cross-fetch')

  global.fetch = fetch

  Object.defineProperties(global, {
    Headers: {
      get() {
        return Headers
      }
    },
    Request: {
      get() {
        return Request
      }
    },
    Response: {
      get() {
        return Response
      }
    }
  })
}

export {}
