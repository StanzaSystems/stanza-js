import { type ServiceConfig } from '@getstanza/hub-client-api';
import { createGlobalState } from './createGlobalState';

interface ServiceStateUninitialized {
  initialized: false;
}
interface ServiceStateInitialized {
  initialized: true;
  data: ServiceConfig | undefined;
}
type ServiceState = ServiceStateUninitialized | ServiceStateInitialized;
const state = createGlobalState(
  Symbol.for('[Stanza SDK Internal] Service Config'),
  (): ServiceState => ({ initialized: false })
);

export type ServiceConfigListener = (config: ServiceState) => void;
export const getServiceConfig = (): ServiceConfig | undefined =>
  state.currentValue.initialized ? state.currentValue.data : undefined;

export const isServiceConfigInitialized = (): boolean =>
  state.currentValue.initialized;

export const updateServiceConfig = (newConfig: ServiceConfig | undefined) =>
  state.update({ initialized: true, data: newConfig });

export const addServiceConfigListener = state.onChange;

export const resetServiceConfig = () => {
  state.update({ initialized: false });
};
