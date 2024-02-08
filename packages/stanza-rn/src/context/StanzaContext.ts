import { createContext } from 'react';
import type { StanzaInstance } from '../types/Common';

export const StanzaReactContext = createContext<StanzaInstance | undefined>(
  undefined
);
