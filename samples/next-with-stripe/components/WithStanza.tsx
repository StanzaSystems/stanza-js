'use client';
import React, {
  useState,
  type PropsWithChildren,
  useCallback,
  useEffect,
} from 'react';
import {
  createStanzaInstance,
  type StanzaInstance,
  StanzaProvider,
} from '@getstanza/react';
import { browserConfig } from '../stanzaConfig';

const WithStanza: React.FC<PropsWithChildren> = ({ children }) => {
  const [stanzaInstance, setStanzaInstance] = useState<StanzaInstance | null>(
    null
  );

  const getStanzaConfig = useCallback(async () => {
    const stanzaInstance = await createStanzaInstance(browserConfig);

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

  return <StanzaProvider instance={stanzaInstance}>{children}</StanzaProvider>;
};

export default WithStanza;
