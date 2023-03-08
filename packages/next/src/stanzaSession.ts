import cookie from 'cookie'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { addCookie } from './addCookie'

interface StanzaSessionOptions {
  name: string
  generateEnablementNumber: () => Promise<number> | number
}

export function stanzaSession (options: Partial<StanzaSessionOptions> = {
}) {
  const {
    name = 'stanza-enablement-number',
    generateEnablementNumber = async () => Math.floor(Math.random() * 99)
  } = options
  const cookieName = name
  return { getEnablementNumber }

  async function getEnablementNumber (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<number> {
    const cookieEnablementNumber = req.cookies[cookieName]
    const enablementNumberMaybe = parseInt(cookieEnablementNumber ?? '')
    const enablementNumber = isNaN(enablementNumberMaybe)
      ? await generateEnablementNumber()
      : enablementNumberMaybe

    isNaN(enablementNumberMaybe) && commitHeader(res, enablementNumber)

    return enablementNumber
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
