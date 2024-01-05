import { type StanzaContext } from '@getstanza/browser';
import { type FeatureState, type StanzaChangeEmitter } from '@getstanza/core';

export interface StanzaInstance {
  contextChanges: StanzaChangeEmitter<StanzaContext>;
  featureChanges: StanzaChangeEmitter<FeatureState>;
}
