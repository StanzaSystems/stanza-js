import { withStanzaHeaders } from './withStanzaHeaders';

describe('withStanzaHeaders', () => {
  it('should create Stanza headers without providing initial headers', () => {
    expect(withStanzaHeaders({ feature: 'testFeature' })).toEqual({
      baggage: 'stz-feat=testFeature',
    });
  });

  it('should append Stanza headers if initial provided as a record', () => {
    expect(
      withStanzaHeaders(
        { feature: 'testFeature' },
        { existingHeader: 'existingHeaderValue' },
      ),
    ).toEqual({
      existingHeader: 'existingHeaderValue',
      baggage: 'stz-feat=testFeature',
    });
  });

  it('should append Stanza headers if initial provided as a Headers object', () => {
    expect(
      withStanzaHeaders(
        { feature: 'testFeature' },
        new Headers({ existingHeader: 'existingHeaderValue' }),
      ),
    ).toEqual(
      new Headers({
        existingHeader: 'existingHeaderValue',
        baggage: 'stz-feat=testFeature',
      }),
    );
  });

  it('should append Stanza headers if initial provided as an array of entries', () => {
    expect(
      withStanzaHeaders({ feature: 'testFeature' }, [
        ['existingHeader', 'existingHeaderValue'],
      ]),
    ).toEqual([
      ['existingHeader', 'existingHeaderValue'],
      ['baggage', 'stz-feat=testFeature'],
    ]);
  });

  it('should not modify initial headers if provided as a record', () => {
    const initialHeaders = { existingHeader: 'existingHeaderValue' };
    withStanzaHeaders({ feature: 'testFeature' }, initialHeaders);
    expect(initialHeaders).toEqual({ existingHeader: 'existingHeaderValue' });
  });

  it('should not modify initial headers if provided as a Headers object', () => {
    const initialHeaders = new Headers({
      existingHeader: 'existingHeaderValue',
    });
    withStanzaHeaders({ feature: 'testFeature' }, initialHeaders);
    expect(initialHeaders).toEqual(
      new Headers({ existingHeader: 'existingHeaderValue' }),
    );
  });

  it('should append Stanza headers if initial provided as an array of entries', () => {
    const initialHeaders = [
      ['existingHeader', 'existingHeaderValue'] as [string, string],
    ];
    withStanzaHeaders({ feature: 'testFeature' }, initialHeaders);
    expect(initialHeaders).toEqual([['existingHeader', 'existingHeaderValue']]);
  });
});
