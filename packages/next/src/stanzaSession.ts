import cookie from 'cookie';
import {
  type NextApiHandler,
  type NextApiRequest,
  type NextApiResponse,
} from 'next';
import { type NextMiddleware, NextResponse } from 'next/server';
import { addCookie } from './addCookie';
import { mergeHeaders } from './mergeHeaders';
import { removeCommonHeaders } from './removeCommonHeaders';

interface StanzaSessionOptions {
  name: string;
  generateEnablementNumber: () => Promise<number> | number;
}

interface StanzaSession {
  enablementNumber: number;
}

const X_STANZA_ENABLEMENT_NUMBER_HEADER = 'x-stanza-enablement-number';

type NextApiRequestWithStanzaSession = NextApiRequest & {
  stanzaSession: StanzaSession;
};

export function stanzaSession(options: Partial<StanzaSessionOptions> = {}) {
  const {
    name = 'stanza-enablement-number',
    generateEnablementNumber = async () => Math.floor(Math.random() * 99),
  } = options;
  const cookieName = name;
  return {
    getEnablementNumber,
    withStanzaSession,
    middleware: withStanzaSessionMiddleware(),
    withStanzaSessionMiddleware,
  };

  async function getEnablementNumber(
    req: Pick<NextApiRequest, 'cookies' | 'headers'>
  ): Promise<number | undefined> {
    const xStanzaEnablementNumber =
      req.headers[X_STANZA_ENABLEMENT_NUMBER_HEADER];
    const cookieEnablementNumber =
      typeof xStanzaEnablementNumber === 'string'
        ? xStanzaEnablementNumber
        : req.cookies[cookieName];
    const enablementNumberMaybe = parseInt(cookieEnablementNumber ?? '');
    return isNaN(enablementNumberMaybe) ? undefined : enablementNumberMaybe;
  }

  function withStanzaSession(
    handler: (
      req: NextApiRequestWithStanzaSession,
      res: NextApiResponse
    ) => unknown | Promise<unknown>
  ): NextApiHandler {
    return async (req, res) => {
      const enablementNumberMaybe = await getEnablementNumber(req);
      const enablementNumber =
        enablementNumberMaybe ?? (await generateEnablementNumber());
      if (enablementNumberMaybe === undefined)
        commitHeader(res, enablementNumber);

      const reqWithStanzaSession: NextApiRequestWithStanzaSession =
        Object.assign(req, {
          stanzaSession: {
            enablementNumber,
          },
        });

      return handler(reqWithStanzaSession, res);
    };
  }

  function withStanzaSessionMiddleware(
    nextMiddleware?: NextMiddleware
  ): NextMiddleware {
    return async (...args) => {
      const [request] = args;
      const cookieEnablementNumber = request.cookies.get(cookieName)?.value;
      const enablementNumberMaybe = parseInt(cookieEnablementNumber ?? '');
      const headers = new Headers(request.headers);
      const enablementNumber = isNaN(enablementNumberMaybe)
        ? await generateEnablementNumber()
        : enablementNumberMaybe;
      const enablementNumberStringValue = enablementNumber.toString();
      headers.set(
        X_STANZA_ENABLEMENT_NUMBER_HEADER,
        enablementNumberStringValue
      );

      const nextMiddlewareResult = await nextMiddleware?.(...args);

      const stanzaResponse = NextResponse.next({
        request: {
          headers,
        },
      });

      // If wrapped middleware return null or undefined we can just return stanzaResponse.
      // Otherwise, we need to merge nextMiddlewareResult with stanzaResponse.
      // To preserve nextMiddlewareResult we don't want to add headers produced by empty NextResponse.next() call
      // so that we don't break rewrites, redirects and direct response returns
      const response =
        nextMiddlewareResult == null
          ? stanzaResponse
          : new NextResponse(
              nextMiddlewareResult?.body ?? stanzaResponse.body,
              {
                headers: mergeHeaders(
                  nextMiddlewareResult.headers,
                  removeCommonHeaders(
                    stanzaResponse.headers,
                    NextResponse.next().headers
                  )
                ),
                status: nextMiddlewareResult?.status ?? stanzaResponse.status,
                statusText:
                  nextMiddlewareResult?.statusText ?? stanzaResponse.statusText,
              }
            );

      if (isNaN(enablementNumberMaybe)) {
        response.cookies.set(cookieName, enablementNumberStringValue);
      }

      return response;
    };
  }

  function commitHeader(res: NextApiResponse, enablementNumber: number) {
    const cookieValue = cookie.serialize(
      cookieName,
      enablementNumber.toString(),
      {
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
      }
    );

    const existingSetCookieHeader = res.getHeader('set-cookie');

    const newCookie = addCookie(existingSetCookieHeader, cookieValue);

    res.setHeader('set-cookie', newCookie);
  }
}
