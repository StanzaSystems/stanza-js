import { describe, expect, it, vi } from 'vitest'
import { getEnvInitOptions } from './getEnvInitOptions'

describe('getEnvInitOptions', () => {
  it('should return empty object if no env variables are set', () => {
    expect(getEnvInitOptions()).toEqual({})
  })

  it('should return a full options object if env variables are set', () => {
    vi.stubEnv('STANZA_HUB_ADDRESS', 'https://url.to.stanza.hub')
    vi.stubEnv('STANZA_API_KEY', 'dummyAPIKey')
    vi.stubEnv('STANZA_SERVICE_NAME', 'dummyStanzaService')
    vi.stubEnv('STANZA_SERVICE_RELEASE', 'dummyStanzaRelease')
    vi.stubEnv('STANZA_ENVIRONMENT', 'testEnvironment')
    vi.stubEnv('STANZA_HUB_REQUEST_TIMEOUT', '1234')

    expect(getEnvInitOptions()).toEqual({
      hubUrl: 'https://url.to.stanza.hub',
      apiKey: 'dummyAPIKey',
      serviceName: 'dummyStanzaService',
      serviceRelease: 'dummyStanzaRelease',
      environment: 'testEnvironment',
      hubRequestTimeout: 1234
    })

    vi.unstubAllEnvs()
  })

  it('should return skipe hubRequestTimeout from options object if env variable is not valid', () => {
    vi.stubEnv('STANZA_HUB_ADDRESS', 'https://url.to.stanza.hub')
    vi.stubEnv('STANZA_API_KEY', 'dummyAPIKey')
    vi.stubEnv('STANZA_SERVICE_NAME', 'dummyStanzaService')
    vi.stubEnv('STANZA_SERVICE_RELEASE', 'dummyStanzaRelease')
    vi.stubEnv('STANZA_ENVIRONMENT', 'testEnvironment')
    vi.stubEnv('STANZA_HUB_REQUEST_TIMEOUT', 'invalid_number')

    expect(getEnvInitOptions()).toEqual({
      hubUrl: 'https://url.to.stanza.hub',
      apiKey: 'dummyAPIKey',
      serviceName: 'dummyStanzaService',
      serviceRelease: 'dummyStanzaRelease',
      environment: 'testEnvironment'
    })

    vi.unstubAllEnvs()
  })
})
