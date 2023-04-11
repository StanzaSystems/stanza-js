import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { init } from './init'
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
    it('should not throw when not options provided', async () => {
      await expect(init()).resolves.toBeUndefined()
    })

    it('should warn if empty config is provided', async () => {
      const warnSpy = vi.spyOn(console, 'warn')

      await init()

      expect(warnSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledWith('Provided options are invalid')
    })
  })

  describe('valid options', () => {
    it('should not throw when valid options provided', async () => {
      await expect(init({
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment'
      })).resolves.toBeUndefined()
    })

    it('should not warn if valid config is provided', async () => {
      const warnSpy = vi.spyOn(console, 'warn')
      fetchMock.mockImplementation(async () => ({
        json: async () => ({})
      }))
      await init({
        hubUrl: 'https://url.to.stanza.hub',
        apiKey: 'dummyAPIKey',
        serviceName: 'dummyStanzaService',
        serviceRelease: 'dummyStanzaRelease',
        environment: 'testEnvironment'
      })

      expect(warnSpy).not.toHaveBeenCalled()

      vi.unstubAllGlobals()
    })

    it('should not warn for empty config if env variables are set', async () => {
      const warnSpy = vi.spyOn(console, 'warn')
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

      await init()

      expect(warnSpy).not.toHaveBeenCalledOnce()
    })
  })
})
