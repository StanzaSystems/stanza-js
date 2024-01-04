import { type Tag } from '@getstanza/hub-client-api';

export interface StanzaGuardOptions {
  guard: string;
  feature?: string;
  priorityBoost?: number;
  tags?: Tag[];
}

export interface StanzaGuardHealthOptions {
  guard: string;
  feature: string;
  environment: string;
  priorityBoost?: number;
  tags?: Tag[];
}
