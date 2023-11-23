import { StanzaMobile } from '@getstanza/mobile';
import { type StanzaCoreConfig } from '@getstanza/core';
import { StanzaInstance } from './types';

export type StanzaConfig = StanzaCoreConfig;

export const createStanzaInstance = (config: StanzaConfig): StanzaInstance => {
  StanzaMobile.init(config);

  return {
    contextChanges: StanzaMobile.contextChanges,
    featureChanges: StanzaMobile.featureChanges,
  };
};
