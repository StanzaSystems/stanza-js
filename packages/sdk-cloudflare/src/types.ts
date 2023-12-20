import { type init as initBase } from '@getstanza/sdk-base';

export type InitBaseOptions = Parameters<typeof initBase>[0];
export type InitOptions = Omit<
  InitBaseOptions,
  'createHubService' | 'useRestHubApi'
> & { scheduler?: { tickSize?: number } };
