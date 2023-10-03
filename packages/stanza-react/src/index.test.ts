import { describe, expect, it } from 'vitest'
import { useStanzaContext } from './index'

describe('index', () => {
  it('useStanzaContext is exported', () => {
    expect(useStanzaContext).toBeDefined()
  })
})
