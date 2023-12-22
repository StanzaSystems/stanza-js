import React, { useCallback, useEffect } from 'react';
import { StanzaReactContext } from './StanzaContext';
import StanzaMobile, { type StanzaCoreConfig } from '@getstanza/mobile';
import { type StanzaInstance } from '../types';

export type StanzaConfig = StanzaCoreConfig;

export interface StanzaProviderProps {
  children?: React.ReactNode;
  config: StanzaConfig;
}

export const StanzaProvider: React.FC<StanzaProviderProps> = ({
  children,
  config,
}) => {
  const [instance, setInstance] = React.useState<StanzaInstance | undefined>(
    undefined
  );

  const initializeStanza = useCallback(async () => {
    await StanzaMobile.init(config);
    setInstance({
      contextChanges: StanzaMobile.contextChanges,
      featureChanges: StanzaMobile.featureChanges,
      refreshSeconds: config.refreshSeconds,
    });
  }, [config]);

  useEffect(() => {
    if (!instance) void initializeStanza();
  }, [instance, initializeStanza]);

  if (!instance) {
    return null;
  }

  return (
    <StanzaReactContext.Provider value={instance}>
      {children}
    </StanzaReactContext.Provider>
  );
};
