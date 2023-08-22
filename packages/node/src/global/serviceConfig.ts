import { type ServiceConfig } from '../hub/model'
import { createGlobalState } from './createGlobalState'

const state = createGlobalState(Symbol.for('[Stanza SDK Internal] Service Config'), (): ServiceConfig | undefined => undefined)

export type ServiceConfigListener = (config: ServiceConfig) => void
export const getServiceConfig = () => state.currentValue

export const updateServiceConfig = state.update

export const addServiceConfigListener = state.onChange
