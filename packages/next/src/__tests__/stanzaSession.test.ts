import { type NextApiRequest, type NextApiResponse } from 'next';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import { assert, describe, expect, it, vi } from 'vitest';
import { stanzaSession } from '../stanzaSession';

const createMockApiRequest = (
  cookies: Partial<Record<string, string>> = {},
  headers: Partial<Record<string, string | string[] | undefined>> = {},
): NextApiRequest =>
  ({
    cookies,
    headers,
  }) as any as NextApiRequest;

const createMockNextRequest = (
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {},
): NextRequest =>
  ({
    cookies: {
      get: (key: string) => ({ value: cookies[key], key }),
    },
    headers: new Headers(headers),
  }) as any as NextRequest;

const createMockNextFetchEvent = () => {
  return {} as any as NextFetchEvent;
};

const createMockApiResponse = ({
  getHeader = () => undefined,
  setHeader = function () {
    return this;
  } as (this: NextApiResponse) => NextApiResponse,
}: Partial<
  Pick<NextApiResponse, 'getHeader' | 'setHeader'>
> = {}): NextApiResponse =>
  ({
    getHeader,
    setHeader,
  }) as any as NextApiResponse;

describe('stanzaSession', () => {
  it('should not throw on creation', () => {
    expect(() => stanzaSession()).not.toThrow();
  });

  it('should return Stanza session object', () => {
    const session = stanzaSession();
    expect(session.getEnablementNumber).toBeDefined();
    expect(typeof session.getEnablementNumber).toBe('function');
  });

  describe('getEnablementNumber', function () {
    it('should return existing value if already exists on request', async () => {
      const req = createMockApiRequest({
        'stanza-enablement-number': '50',
      });
      const session = stanzaSession();
      await expect(session.getEnablementNumber(req)).resolves.toBe(50);
    });

    it("should return undefined if cookie doesn't exists on request", async () => {
      const req = createMockApiRequest();
      const session = stanzaSession();
      await session.getEnablementNumber(req);

      const enablementNumber = await session.getEnablementNumber(req);

      expect(enablementNumber).toBeUndefined();
    });

    it('should return undefined if if cookie contains invalid value', async () => {
      const req = createMockApiRequest({
        'stanza-enablement-number': 'invalidValue',
      });
      const session = stanzaSession();

      const enablementNumber = await session.getEnablementNumber(req);

      expect(enablementNumber).toBeUndefined();
    });
  });

  describe('middleware', function () {
    it('should set x-stanza-enablement-number header with a cookie on a request', async () => {
      const nextResponseSpy = vi.spyOn(NextResponse, 'next');
      const req = createMockNextRequest({
        'stanza-enablement-number': '50',
      });
      const session = stanzaSession({
        generateEnablementNumber: () => 99,
      });

      await session.middleware(req, createMockNextFetchEvent());

      expect(nextResponseSpy).toHaveBeenCalledTimes(1);
      expect(nextResponseSpy).toHaveBeenCalledWith({
        request: {
          headers: new Headers({
            'x-stanza-enablement-number': '50',
          }),
        },
      });
    });

    it('should not generate new enablement number if it does exist on request', async () => {
      const req = createMockNextRequest({
        'stanza-enablement-number': '50',
      });
      const generateEnablementNumber = vi.fn(() => 99);
      const session = stanzaSession({
        generateEnablementNumber,
      });
      await session.middleware(req, createMockNextFetchEvent());

      expect(generateEnablementNumber).not.toHaveBeenCalled();
    });

    it('should not set new cookie if already exists on request', async () => {
      const req = createMockNextRequest({
        'stanza-enablement-number': '50',
      });
      const session = stanzaSession({
        generateEnablementNumber: () => 99,
      });
      const res = await session.middleware(req, createMockNextFetchEvent());

      assert(res instanceof NextResponse);

      expect(
        res.cookies.get('stanza-enablement-number')?.value,
      ).toBeUndefined();
    });

    it('should generate new random enablement number if it does not exist on request', async () => {
      const req = createMockNextRequest();
      const generateEnablementNumber = vi.spyOn(Math, 'random');
      generateEnablementNumber.mockImplementationOnce(() => 0.5);
      const session = stanzaSession();
      const res = await session.middleware(req, createMockNextFetchEvent());

      assert(res instanceof NextResponse);

      expect(generateEnablementNumber).toHaveBeenCalledTimes(1);
      expect(res.cookies.get('stanza-enablement-number')?.value).toBe('49');
    });

    it('should generate new enablement number if it does not exist on request', async () => {
      const req = createMockNextRequest();
      const generateEnablementNumber = vi.fn(() => 99);
      const session = stanzaSession({
        generateEnablementNumber,
      });
      await session.middleware(req, createMockNextFetchEvent());

      expect(generateEnablementNumber).toHaveBeenCalledTimes(1);
    });

    it('should set response cookie if enablement number does not exist on request', async () => {
      const req = createMockNextRequest();
      const session = stanzaSession({
        generateEnablementNumber: () => 99,
      });
      const res = await session.middleware(req, createMockNextFetchEvent());

      assert(res instanceof NextResponse);

      expect(res.cookies.get('stanza-enablement-number')?.value).toBe('99');
    });

    it('should generate new enablement number if it is not valid on request', async () => {
      const req = createMockNextRequest({
        'stanza-enablement-number': 'invalidNumber',
      });
      const generateEnablementNumber = vi.fn(() => 99);
      const session = stanzaSession({
        generateEnablementNumber,
      });
      await session.middleware(req, createMockNextFetchEvent());

      expect(generateEnablementNumber).toHaveBeenCalledTimes(1);
    });

    it('should set response cookie if enablement number is not valid on request', async () => {
      const req = createMockNextRequest({
        'stanza-enablement-number': 'invalidNumber',
      });
      const session = stanzaSession({
        generateEnablementNumber: () => 99,
      });
      const res = await session.middleware(req, createMockNextFetchEvent());

      assert(res instanceof NextResponse);

      expect(res.cookies.get('stanza-enablement-number')?.value).toBe('99');
    });
  });

  describe('withStanzaSession', function () {
    it('should add existing enablement number to a session', function () {
      const req = createMockApiRequest(
        {},
        {
          'x-stanza-enablement-number': '50',
        },
      );
      const res = createMockApiResponse();

      const session = stanzaSession();

      session.withStanzaSession((req, _) => {
        expect(req.stanzaSession.enablementNumber).toEqual(50);
      })(req, res);

      expect.assertions(1);
    });

    it('should add existing enablement number to a session from a cookie', function () {
      const req = createMockApiRequest({
        'stanza-enablement-number': '50',
      });
      const res = createMockApiResponse();

      const session = stanzaSession();

      session.withStanzaSession((req, _) => {
        expect(req.stanzaSession.enablementNumber).toEqual(50);
      })(req, res);

      expect.assertions(1);
    });

    it('should choose enablement number to a header over a cookie', function () {
      const req = createMockApiRequest(
        {
          'stanza-enablement-number': '50',
        },
        {
          'x-stanza-enablement-number': '60',
        },
      );
      const res = createMockApiResponse();

      const session = stanzaSession();

      session.withStanzaSession((req, _) => {
        expect(req.stanzaSession.enablementNumber).toEqual(60);
      })(req, res);

      expect.assertions(1);
    });

    it('should generate new enablement number if it does not exist on a request', function () {
      const req = createMockApiRequest({});
      const res = createMockApiResponse();

      const generateEnablementNumber = vi.fn(() => 99);
      const session = stanzaSession({
        generateEnablementNumber,
      });

      session.withStanzaSession((req, _) => {
        expect(generateEnablementNumber).toHaveBeenCalledOnce();
        expect(req.stanzaSession.enablementNumber).toEqual(99);
      })(req, res);

      expect.assertions(2);
    });

    it('should generate new enablement number request contains invalid value', function () {
      const req = createMockApiRequest({
        'x-stanza-enablement-number': 'invalidValue',
      });
      const res = createMockApiResponse();

      const generateEnablementNumber = vi.fn(() => 99);
      const session = stanzaSession({
        generateEnablementNumber,
      });

      session.withStanzaSession((req, _) => {
        expect(generateEnablementNumber).toHaveBeenCalledOnce();
        expect(req.stanzaSession.enablementNumber).toEqual(99);
      })(req, res);

      expect.assertions(2);
    });
  });
});
