import { expect } from 'vitest'
import { removeCommonHeaders } from './removeCommonHeaders'

describe('removeCommonHeaders', () => {
  it('should not remove any headers if no common headers present', () => {
    expect(removeCommonHeaders(
      new Headers({
        firstTestHeader: 'firstTestHeaderValue',
        firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
        firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue'
      }),
      new Headers({
        secondTestHeader: 'secondTestHeaderValue',
        secondAnotherTestHeader: 'secondAnotherTestHeaderValue',
        secondYetAnotherTestHeader: 'secondYetAnotherTestHeaderValue'
      })
    )).toEqual(new Headers({
      firstTestHeader: 'firstTestHeaderValue',
      firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
      firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue'
    }))
  })

  it('should remove common headers', () => {
    expect(removeCommonHeaders(
      new Headers({
        firstTestHeader: 'firstTestHeaderValue',
        firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
        firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue',
        commonHeader: 'commonHeaderValue'
      }),
      new Headers({
        secondTestHeader: 'secondTestHeaderValue',
        secondAnotherTestHeader: 'secondAnotherTestHeaderValue',
        secondYetAnotherTestHeader: 'secondYetAnotherTestHeaderValue',
        commonHeader: 'commonHeaderValue'
      })
    )).toEqual(new Headers({
      firstTestHeader: 'firstTestHeaderValue',
      firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
      firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue'
    }))
  })
})
