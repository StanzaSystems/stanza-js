import { stanzaSession } from '@getstanza/next'
import { NextResponse } from 'next/server'

export default stanzaSession().withStanzaSessionMiddleware((req) => {
  if (req.nextUrl.pathname === '/api/test/response') {
    return new Response('direct response')
  }
  if (req.nextUrl.pathname === '/api/test/undefined') {
    return undefined
  }
  if (req.nextUrl.pathname === '/api/test/null') {
    return undefined
  }
  if (req.nextUrl.pathname === '/api/test/next') {
    return NextResponse.next({
      request: {
        headers: new Headers({
          testNextHeader: 'testNextHeaderValue'
        })
      },
      headers: {
        testNextResponseHeader: 'testNextResponseHeaderValue'
      }
    })
  }
  if (req.nextUrl.pathname === '/api/test/rewrite') {
    return NextResponse.rewrite('http://localhost:4200' + '/api/test/rewriteDestination', {
      request: {
        headers: new Headers({
          testRewriteHeader: 'testRewriteHeaderValue'
        })
      },
      headers: {
        testRewriteResponseHeader: 'testRewriteResponseHeaderValue'
      }
    })
  }
  if (req.nextUrl.pathname === '/api/test/redirect') {
    console.log('host', req.nextUrl.host)
    return NextResponse.redirect('http://localhost:4200' + '/api/test/redirectDestination', {
      headers: {
        testRewriteResponseHeader: 'testRewriteResponseHeaderValue'
      }
    })
  }
  if (req.nextUrl.pathname === '/api/test/json') {
    return NextResponse.json({ jsonResponse: 'testJsonResponse' }, {
      headers: {
        testRewriteJsonHeader: 'testRewriteJsonHeaderValue'
      }
    })
  }
  return undefined
})
