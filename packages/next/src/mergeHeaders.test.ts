import { mergeHeaders } from './mergeHeaders';
import { expect } from 'vitest';

describe('mergeHeaders', () => {
  it('should return empty headers if not arguments provided', () => {
    expect(mergeHeaders()).toEqual(new Headers());
  });

  it('should return same headers if only one argument provided', () => {
    expect(
      mergeHeaders(
        new Headers({
          firstTestHeader: 'firstTestHeaderValue',
          firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
          firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue',
        })
      )
    ).toEqual(
      new Headers({
        firstTestHeader: 'firstTestHeaderValue',
        firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
        firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue',
      })
    );
  });

  it('should return merge two distinct headers', () => {
    expect(
      mergeHeaders(
        new Headers({
          firstTestHeader: 'firstTestHeaderValue',
          firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
          firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue',
        }),
        new Headers({
          secondTestHeader: 'secondTestHeaderValue',
          secondAnotherTestHeader: 'secondAnotherTestHeaderValue',
          secondYetAnotherTestHeader: 'secondYetAnotherTestHeaderValue',
        })
      )
    ).toEqual(
      new Headers({
        firstTestHeader: 'firstTestHeaderValue',
        firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
        firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue',
        secondTestHeader: 'secondTestHeaderValue',
        secondAnotherTestHeader: 'secondAnotherTestHeaderValue',
        secondYetAnotherTestHeader: 'secondYetAnotherTestHeaderValue',
      })
    );
  });

  it('should return merge two headers with common header keys', () => {
    expect(
      mergeHeaders(
        new Headers({
          firstTestHeader: 'firstTestHeaderValue',
          firstAnotherTestHeader: 'firstAnotherTestHeaderValue',
          firstYetAnotherTestHeader: 'firstYetAnotherTestHeaderValue',
        }),
        new Headers({
          firstTestHeader: 'secondTestHeaderValue',
          firstAnotherTestHeader: 'secondAnotherTestHeaderValue',
          firstYetAnotherTestHeader: 'secondYetAnotherTestHeaderValue',
        })
      )
    ).toEqual(
      new Headers({
        firstTestHeader: 'secondTestHeaderValue',
        firstAnotherTestHeader: 'secondAnotherTestHeaderValue',
        firstYetAnotherTestHeader: 'secondYetAnotherTestHeaderValue',
      })
    );
  });
});
