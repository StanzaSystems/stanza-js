import { StanzaBrowser } from '@getstanza/browser';
import { type StanzaCoreConfig } from '@getstanza/core';
import { type StanzaInstance } from './stanzaInstance';

export type StanzaConfig = StanzaCoreConfig;

export const createStanzaInstance = async (
  config: StanzaConfig
): Promise<StanzaInstance> => {
  await StanzaBrowser.init(config);

  return {
    contextChanges: StanzaBrowser.contextChanges,
    featureChanges: StanzaBrowser.featureChanges,
  };
};
