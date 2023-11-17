'use client';
import React, { type PropsWithChildren } from 'react';
import { createStanzaInstance, StanzaProvider } from '@getstanza/react';
import { browserConfig } from '../stanzaConfig';
import { type FeatureState } from '@getstanza/core';

const stanzaInstance = createStanzaInstance(browserConfig);

const WithStanza: React.FC<
  PropsWithChildren<{ initialFeatureStates?: FeatureState[] }>
> = ({ children, initialFeatureStates = [] }) => {
  stanzaInstance.initState(initialFeatureStates);
  return <StanzaProvider instance={stanzaInstance}>{children}</StanzaProvider>;
};

export default WithStanza;
