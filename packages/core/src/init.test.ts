import { init } from './init'
import { assert } from 'vitest'
import type * as globalsModule from './globals'

type GlobalsModule = typeof globalsModule

vi.mock('./globals', async (importOriginal) => {
  const original = await importOriginal<GlobalsModule>()
  return {
    ...original,
    init: () => {}
  } satisfies GlobalsModule
})

describe('init', () => {
  it('should init Stanza core properly', async () => {
    vi.useFakeTimers()

    init({
      environment: 'testEnvironment',
      stanzaApiKey: 'testApiKey',
      url: 'https://url.to.hub',
      contextConfigs: []
    })

    await vi.advanceTimersByTimeAsync(0)

    assert.ok('should init without errors')

    vi.useRealTimers()
  })

  it('should NOT leak errors if pollDelay rejects', async () => {
    vi.useFakeTimers()

    init({
      environment: 'testEnvironment',
      stanzaApiKey: 'testApiKey',
      url: 'https://url.to.hub',
      contextConfigs: [],
      pollDelay: Promise.resolve().then(async () => {
        await new Promise((resolve) => setTimeout(resolve))
        return Promise.reject(new Error('kaboom'))
      })
    })

    await vi.advanceTimersByTimeAsync(0)

    assert.ok('should init without errors')

    vi.useRealTimers()
  })

  it('should NOT leak errors if pollDelay throws', async () => {
    vi.useFakeTimers()

    init({
      environment: 'testEnvironment',
      stanzaApiKey: 'testApiKey',
      url: 'https://url.to.hub',
      contextConfigs: [],
      pollDelay: new Promise(() => {
        throw new Error('kaboom')
      })
    })

    await vi.advanceTimersByTimeAsync(0)

    assert.ok('should init without errors')

    vi.useRealTimers()
  })
})
