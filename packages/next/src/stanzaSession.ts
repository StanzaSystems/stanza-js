import cookie from 'cookie'
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next'
import { type NextRequest, NextResponse } from 'next/server'
import { addCookie } from './addCookie'

interface StanzaSessionOptions {
  name: string
  generateEnablementNumber: () => Promise<number> | number
}

interface StanzaSession {
  enablementNumber: number
}

const X_STANZA_ENABLEMENT_NUMBER_HEADER = 'x-stanza-enablement-number'

type NextApiRequestWithStanzaSession = NextApiRequest & { stanzaSession: StanzaSession }

export function stanzaSession (options: Partial<StanzaSessionOptions> = {
}) {
  const {
    name = 'stanza-enablement-number',
    generateEnablementNumber = async () => Math.floor(Math.random() * 99)
  } = options
  const cookieName = name
  return { getEnablementNumber, withStanzaSession, middleware }

  async function getEnablementNumber (
    req: Pick<NextApiRequest, 'cookies' | 'headers'>
  ): Promise<number | undefined> {
    const xStanzaEnablementNumber = req.headers[X_STANZA_ENABLEMENT_NUMBER_HEADER]
    const cookieEnablementNumber = typeof xStanzaEnablementNumber === 'string' ? xStanzaEnablementNumber : req.cookies[cookieName]
    const enablementNumberMaybe = parseInt(cookieEnablementNumber ?? '')
    return isNaN(enablementNumberMaybe)
      ? undefined
      : enablementNumberMaybe
  }

  function withStanzaSession (handler: ((req: NextApiRequestWithStanzaSession, res: NextApiResponse) => unknown | Promise<unknown>)): NextApiHandler {
    return async (req, res) => {
      const enablementNumberMaybe = await getEnablementNumber(req)
      const enablementNumber = enablementNumberMaybe !== undefined ? enablementNumberMaybe : await generateEnablementNumber()
      if (enablementNumberMaybe === undefined) commitHeader(res, enablementNumber)

      const reqWithStanzaSession: NextApiRequestWithStanzaSession = Object.assign(req, {
        stanzaSession: {
          enablementNumber
        }
      })

      return handler(reqWithStanzaSession, res)
    }
  }

  async function middleware (request: NextRequest): Promise<NextResponse> {
    const cookieEnablementNumber = request.cookies.get(cookieName)?.value
    const enablementNumberMaybe = parseInt(cookieEnablementNumber ?? '')
    const headers = new Headers(request.headers)
    const enablementNumber = isNaN(enablementNumberMaybe) ? await generateEnablementNumber() : enablementNumberMaybe
    const enablementNumberStringValue = enablementNumber.toString()
    headers.set(X_STANZA_ENABLEMENT_NUMBER_HEADER, enablementNumberStringValue)
    const response = NextResponse.next({
      request: {
        headers
      }
    })

    if (isNaN(enablementNumberMaybe)) {
      response.cookies.set(cookieName, enablementNumberStringValue)
    }

    return response
  }

  function commitHeader (res: NextApiResponse, enablementNumber: number) {
    const cookieValue = cookie.serialize(
      cookieName,
      enablementNumber.toString(),
      {
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: true
      }
    )

    const existingSetCookieHeader = res.getHeader('set-cookie')

    const newCookie = addCookie(existingSetCookieHeader, cookieValue)

    res.setHeader('set-cookie', newCookie)
  }
}
