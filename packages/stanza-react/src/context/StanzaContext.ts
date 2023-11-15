import { createContext } from 'react';
import { type StanzaInstance } from '../stanzaInstance';

export const StanzaReactContext = createContext<StanzaInstance | undefined>(
  undefined
);
