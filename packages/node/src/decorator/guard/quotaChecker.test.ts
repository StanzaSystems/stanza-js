import { beforeEach, describe, expect, it } from 'vitest'
import { type DecoratorConfig } from '../../hub/model'
import { initQuotaChecker } from './quotaChecker'
import { updateDecoratorConfig } from '../../global/decoratorConfig'
import { mockHubService } from '../../__tests__/mocks/mockHubService'

beforeEach(() => {
  mockHubService.reset()
})

describe('quotaChecker', () => {
  beforeEach(() => {
    // @ts-expect-error: resetting decorator config
    updateDecoratorConfig(undefined)
  })

  describe('shouldCheckQuota()', () => {
    const { shouldCheckQuota } = initQuotaChecker({
      decorator: 'testDecorator'
    })

    it('should check quota', () => {
      updateDecoratorConfig('testDecorator', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: []
        } satisfies Partial<DecoratorConfig['config']> as any
      })

      expect(shouldCheckQuota()).toBe(true)
    })

    it('should NOT check quota', () => {
      updateDecoratorConfig('testDecorator', {
        version: 'testVersion',
        config: {
          checkQuota: false,
          quotaTags: []
        } satisfies Partial<DecoratorConfig['config']> as any
      })

      expect(shouldCheckQuota()).toBe(false)
    })
  })

  describe('checkQuota()', () => {
    it('should send tag to get token lease', () => {
      const { checkQuota } = initQuotaChecker({
        decorator: 'testDecorator',
        tags: ['validQuotaTag']
      })

      updateDecoratorConfig('testDecorator', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag']
        } satisfies Partial<DecoratorConfig['config']> as any
      })

      void checkQuota()

      expect(mockHubService.getToken).toHaveBeenCalledOnce()
      expect(mockHubService.getToken).toHaveBeenCalledWith({
        decorator: 'testDecorator',
        tags: ['validQuotaTag']
      })
    })

    it('should send multiple tags to get token lease', () => {
      const { checkQuota } = initQuotaChecker({
        decorator: 'testDecorator',
        tags: ['validQuotaTag', 'anotherValidQuotaTag']
      })

      updateDecoratorConfig('testDecorator', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag']
        } satisfies Partial<DecoratorConfig['config']> as any
      })

      void checkQuota()

      expect(mockHubService.getToken).toHaveBeenCalledOnce()
      expect(mockHubService.getToken).toHaveBeenCalledWith({
        decorator: 'testDecorator',
        tags: ['validQuotaTag', 'anotherValidQuotaTag']
      })
    })

    it('should send only valid tag to get token lease', () => {
      const { checkQuota } = initQuotaChecker({
        decorator: 'testDecorator',
        tags: ['validQuotaTag', 'invalidQuotaTag']
      })

      updateDecoratorConfig('testDecorator', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag']
        } satisfies Partial<DecoratorConfig['config']> as any
      })

      void checkQuota()

      expect(mockHubService.getToken).toHaveBeenCalledOnce()
      expect(mockHubService.getToken).toHaveBeenCalledWith({
        decorator: 'testDecorator',
        tags: ['validQuotaTag']
      })
    })
  })
})
