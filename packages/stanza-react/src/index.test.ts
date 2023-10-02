import { describe, expect, it } from 'vitest'
import { createStanzaInstance } from './index'

describe('index', () => {
  it('createStanzaInstance is exported', () => {
    expect(createStanzaInstance).toBeDefined()
  })
})
