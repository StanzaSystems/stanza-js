import { beforeEach, describe, expect, it } from 'vitest'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { getQuota } from './getQuota'

beforeEach(() => {
  mockHubService.reset()
})
describe('getQuota', function () {
  it('should return null if getting quota times out', async function () {
    await expect(getQuota({ decorator: 'testDecorator' })).resolves.toEqual(null)
  })

  it('should get quota if hubService returns valid token', async () => {
    mockHubService.getToken.mockImplementationOnce(async () => Promise.resolve({ granted: true, token: 'testToken' }))

    await expect(getQuota({ decorator: 'testDecorator' })).resolves.toEqual({
      granted: true,
      token: 'testToken'
    })
  })
})
