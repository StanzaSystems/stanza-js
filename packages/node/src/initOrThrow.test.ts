import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initOrThrow } from './initOrThrow'
import { type StanzaInitOptions } from './stanzaInitOptions'
import type { getEnvInitOptions as getEnvInitOptionsType } from './getEnvInitOptions'

vi.mock('./getEnvInitOptions', () => {
  return {
    getEnvInitOptions: (): StanzaInitOptions => {
      return getEnvInitOptionsMock()
    }
  }
})

const getEnvInitOptionsMock = vi.fn()
const fetchMock = vi.fn()

beforeEach(async () => {
  const { getEnvInitOptions } = await vi.importActual<{ getEnvInitOptions: typeof getEnvInitOptionsType }>('./getEnvInitOptions')
  getEnvInitOptionsMock.mockImplementation(getEnvInitOptions)
  fetchMock.mockImplementation(fetch)
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  getEnvInitOptionsMock.mockReset()
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('Stanza init', function () {
  describe('invalid options', () => {
    it('should throw when not options provided', async () => {
      await expect(initOrThrow()).rejects.toEqual(new Error('Provided options are invalid'))
    })

    it('should warn if empty config is provided', async () => {
      await expect(initOrThrow()).rejects.toEqual(new Error('Provided options are invalid'))
    })
  })

  describe('valid options', () => {
    it('should resolve when valid options provided', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({})
      }))
      await expect(initOrThrow({
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment'
      })).resolves.toBeUndefined()
    })

    it('should resolve if valid config is provided', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({})
      }))
      await expect(initOrThrow({
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment'
      })).resolves.toBeUndefined()
    })

    it('should resolve for empty config if env variables are set', async () => {
      fetchMock.mockImplementation(async () => ({
        json: async () => ({})
      }))
      getEnvInitOptionsMock.mockImplementation(() => {
        return {
          hubUrl: 'https://url.to.stanza.hub',
          apiKey: 'dummyAPIKey',
          serviceName: 'dummyStanzaService',
          serviceRelease: 'dummyStanzaRelease',
          environment: 'testEnvironment'
        }
      })

      await expect(initOrThrow()).resolves.toBeUndefined()
    })
  })
})
