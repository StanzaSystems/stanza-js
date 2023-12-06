import {
  createStanzaInstance,
  type StanzaInstance,
  StanzaProvider,
} from '@getstanza/react';
import type { AppProps } from 'next/app';
import * as process from 'process';
import { browserConfig } from '../stanzaConfig';
import '../styles/globals.css';
import { useCallback, useEffect, useState } from 'react';

let loadPromise: Promise<any> = Promise.resolve();
if (process.env.NODE_ENV === 'development') {
  const mswMock = import('../msw/mock');
  loadPromise = mswMock.then(async (module) => module.initMocks());
}
if (typeof window === 'undefined') {
  loadPromise = new Promise(() => {});
}

function MyApp({ Component, pageProps }: AppProps) {
  const [stanzaInstance, setStanzaInstance] = useState<StanzaInstance | null>(
    null
  );

  const getStanzaConfig = useCallback(async () => {
    const stanzaInstance = await createStanzaInstance({
      ...browserConfig,
      pollDelay: loadPromise,
    });

    setStanzaInstance(stanzaInstance);
  }, []);

  useEffect(() => {
    if (stanzaInstance === null) {
      void getStanzaConfig();
    }
  }, [getStanzaConfig, stanzaInstance]);

  if (stanzaInstance === null) {
    return null;
  }

  return (
    <StanzaProvider instance={stanzaInstance}>
      <Component {...pageProps} />
    </StanzaProvider>
  );
}

export default MyApp;
