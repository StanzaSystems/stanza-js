import { createStanzaInstance, StanzaProvider } from '@getstanza/react';
import type { AppProps } from 'next/app';
import * as process from 'process';
import { browserConfig } from '../stanzaConfig';
import '../styles/globals.css';

let loadPromise: Promise<any> = Promise.resolve();
if (process.env.NODE_ENV === 'development') {
  const mswMock = import('../msw/mock');
  loadPromise = mswMock.then(async (module) => module.initMocks());
}
if (typeof window === 'undefined') {
  loadPromise = new Promise(() => {});
}

const stanzaInstance = createStanzaInstance({
  ...browserConfig,
  pollDelay: loadPromise,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StanzaProvider instance={stanzaInstance}>
      <Component {...pageProps} />
    </StanzaProvider>
  );
}

export default MyApp;
