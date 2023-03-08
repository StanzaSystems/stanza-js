import { type NextApiRequest, type NextApiResponse } from 'next'
import { describe, expect, it, vi } from 'vitest'
import { stanzaSession } from '../stanzaSession'

const createMockRequest = (cookies: Partial<Record<string, string>> = {}): NextApiRequest => ({
  cookies
} as any as NextApiRequest)

const createMockResponse = ({
  getHeader = () => undefined, setHeader = function () {
    return this
  } as (this: NextApiResponse) => NextApiResponse
}: Partial<Pick<NextApiResponse, 'getHeader' | 'setHeader'>> = {}): NextApiResponse => ({
  getHeader,
  setHeader
} as any as NextApiResponse)

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
    const res = createMockResponse()
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await expect(session.getEnablementNumber(req, res)).resolves.toBe(50)
  })

  it('should generate enablement number if doesn\'t exists on request', async () => {
    const req = createMockRequest()
    const res = createMockResponse()
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await expect(session.getEnablementNumber(req, res)).resolves.toBe(99)
  })

  it('should generate enablement number if cookie contains invalid value', async () => {
    const req = createMockRequest({
      'stanza-enablement-number': 'invalidValue'
    })
    const res = createMockResponse()
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await expect(session.getEnablementNumber(req, res)).resolves.toBe(99)
  })

  it('should not set new cookie if already exists on request', async () => {
    const req = createMockRequest({
      'stanza-enablement-number': '50'
    })
    const setHeader: NextApiResponse['setHeader'] = vi.fn(function () {
      return this
    } as (this: NextApiResponse) => NextApiResponse)
    const res = createMockResponse({
      setHeader
    })
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await session.getEnablementNumber(req, res)

    expect(setHeader).not.toHaveBeenCalled()
  })

  it('should set new cookie if doesn\'t exists on request', async () => {
    const req = createMockRequest({
      'stanza-enablement-number': 'invalidValue'
    })
    const setHeader: NextApiResponse['setHeader'] = vi.fn(function () {
      return this
    } as (this: NextApiResponse) => NextApiResponse)
    const res = createMockResponse({
      setHeader
    })
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await session.getEnablementNumber(req, res)

    expect(setHeader).toHaveBeenCalledOnce()
    expect(setHeader).toHaveBeenCalledWith('set-cookie', 'stanza-enablement-number=99; Path=/; HttpOnly; Secure; SameSite=Lax')
  })

  it('should set new cookie if if cookie contains invalid value', async () => {
    const req = createMockRequest()
    const setHeader: NextApiResponse['setHeader'] = vi.fn(function () {
      return this
    } as (this: NextApiResponse) => NextApiResponse)
    const res = createMockResponse({
      setHeader
    })
    const session = stanzaSession({
      generateEnablementNumber: () => 99
    })
    await session.getEnablementNumber(req, res)

    expect(setHeader).toHaveBeenCalledOnce()
    expect(setHeader).toHaveBeenCalledWith('set-cookie', 'stanza-enablement-number=99; Path=/; HttpOnly; Secure; SameSite=Lax')
  })
})
