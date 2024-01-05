import {
  init as initBase,
  initOrThrow as initOrThrowBase,
} from '@getstanza/sdk-base';
import { cloudflareScheduler } from './cloudflareScheduler';
import { type InitOptions } from './types';
import { createInitBaseOptions } from './createInitBaseOptions';

export * from '@getstanza/sdk-base';
export * from './withStanzaHeaders';
export * from './stanzaCloudflareHandler';

export async function init(options: InitOptions) {
  return initBase(createInitBaseOptions(options), cloudflareScheduler);
}

export async function initOrThrow(options: InitOptions) {
  return initOrThrowBase(createInitBaseOptions(options), cloudflareScheduler);
}
