import { type StanzaContext } from '@getstanza/mobile';
import { type FeatureState, type StanzaChangeEmitter } from '@getstanza/core';

export interface StanzaInstance {
  contextChanges: StanzaChangeEmitter<StanzaContext>;
  featureChanges: StanzaChangeEmitter<FeatureState>;
  refreshSeconds?: number;
}
