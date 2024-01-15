import { createGlobalState } from './createGlobalState';
import packageJson from '../../../package.json';

const state = createGlobalState(
  Symbol.for('[Stanza SDK Internal] SDK Metadata'),
  () => ({
    name: packageJson.name,
    version: packageJson.version,
  })
);

export const updateSdkMetadata = state.update;

export const getSdkMetadata = () => state.currentValue;
