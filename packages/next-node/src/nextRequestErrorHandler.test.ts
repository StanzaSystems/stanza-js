import { StanzaGuardError } from '@getstanza/node'
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextRequestErrorHandler } from './nextRequestErrorHandler'

describe('nextRequestErrorHandler', () => {
  const handler = vi.fn()
  const mockRes = {
    status () {
      return this
    },
    json () {
      return this
    }
  } as unknown as NextApiResponse
  const mockReq: NextApiRequest = {} as unknown as NextApiRequest

  let wrappedHandler: NextApiHandler

  beforeEach(() => {
    handler.mockReset()
    wrappedHandler = nextRequestErrorHandler(handler)
  })

  it('should catch StanzaDecoratorError - NoQuota', async function () {
    handler.mockImplementationOnce(() => {
      throw new StanzaGuardError('NoQuota', 'Message')
    })

    expect(async () => {
      await wrappedHandler(mockReq, mockRes)
    }).not.toThrow()

    await expect(wrappedHandler(mockReq, mockRes)).resolves.not.toThrow()
  })

  it('should catch StanzaDecoratorError - InvalidToken', async function () {
    handler.mockImplementationOnce(() => {
      throw new StanzaGuardError('InvalidToken', 'Message')
    })

    expect(async () => {
      await wrappedHandler(mockReq, mockRes)
    }).not.toThrow()

    await expect(wrappedHandler(mockReq, mockRes)).resolves.not.toThrow()
  })

  it('should not catch non Stanza error', async function () {
    handler.mockImplementationOnce(() => {
      throw new Error('NonStanzaError')
    })

    await expect(wrappedHandler(mockReq, mockRes)).rejects.toThrow(new Error('NonStanzaError'))
  })
})
