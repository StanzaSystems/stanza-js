import { type NextApiRequest, type NextApiResponse } from 'next'
import { describe, expect, it, vi } from 'vitest'
import { stanzaSession } from '../stanzaSession'

const createMockRequest = (cookies: Partial<Record<string, string>> = {}, headers: Partial<Record<string, string | string[] | undefined>> = {}): NextApiRequest => ({
  cookies,
  headers
} as any as NextApiRequest)

// const createMockResponse = ({
//   getHeader = () => undefined, setHeader = function () {
//     return this
//   } as (this: NextApiResponse) => NextApiResponse
// }: Partial<Pick<NextApiResponse, 'getHeader' | 'setHeader'>> = {}): NextApiResponse => ({
//   getHeader,
//   setHeader
// } as any as NextApiResponse)

describe('stanzaSession', () => {
  it('should not throw on creation', () => {
    expect(() => stanzaSession()).not.toThrow()
  })

  it('should return Stanza session object', () => {
    const session = stanzaSession()
    expect(session.getEnablementNumber).toBeDefined()
    expect(typeof session.getEnablementNumber).toBe('function')
  })

  it('should return existing value if already exists on request', async () => {
    const req = createMockRequest({
      'stanza-enablement-number': '50'
    })
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await expect(session.getEnablementNumber(req)).resolves.toBe(50)
  })

  it('should not set new cookie if already exists on request', async () => {
    const req = createMockRequest({
      'stanza-enablement-number': '50'
    })
    const setHeader: NextApiResponse['setHeader'] = vi.fn(function () {
      return this
    } as (this: NextApiResponse) => NextApiResponse)
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await session.getEnablementNumber(req)

    expect(setHeader).not.toHaveBeenCalled()
  })

  it('should return undefined if cookie doesn\'t exists on request', async () => {
    const req = createMockRequest()
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await session.getEnablementNumber(req)

    const enablementNumber = await session.getEnablementNumber(req)

    expect(enablementNumber).toBeUndefined()
  })

  it('should return undefined if if cookie contains invalid value', async () => {
    const req = createMockRequest({
      'stanza-enablement-number': 'invalidValue'
    })
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })

    const enablementNumber = await session.getEnablementNumber(req)

    expect(enablementNumber).toBeUndefined()
  })
})
