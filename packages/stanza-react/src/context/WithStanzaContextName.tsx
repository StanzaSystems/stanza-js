import React from 'react';
import { StanzaContextName } from './StanzaContextName';

interface WithStanzaContextNameProps {
  children?: React.ReactNode;
  name: string;
}

export const WithStanzaContextName: React.FC<WithStanzaContextNameProps> = (
  props
) => {
  const { children, name } = props;

  return (
    <StanzaContextName.Provider value={name}>
      {children}
    </StanzaContextName.Provider>
  );
};
