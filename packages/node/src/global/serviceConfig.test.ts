import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ServiceConfig } from '../hub/model';
import type * as serviceConfigModuleImport from './serviceConfig';
type ServiceConfigModule = typeof serviceConfigModuleImport;

const GLOBAL_STATE_RECORD_SYMBOL = Symbol.for(
  '[Stanza SDK Internal] Global states',
);
const STANZA_SERVICE_CONFIG_SYMBOL = Symbol.for(
  '[Stanza SDK Internal] Service Config',
);
describe('serviceConfig', function () {
  let serviceConfigModule: ServiceConfigModule;

  beforeEach(async () => {
    const globalAsAny = global as any;
    globalAsAny[STANZA_SERVICE_CONFIG_SYMBOL] = undefined;
    if (globalAsAny[GLOBAL_STATE_RECORD_SYMBOL] !== undefined) {
      globalAsAny[GLOBAL_STATE_RECORD_SYMBOL][STANZA_SERVICE_CONFIG_SYMBOL] =
        undefined;
    }
    vi.resetModules();
    serviceConfigModule = await import('./serviceConfig');
  });
  it('should return undefined initially', function () {
    const serviceConfig = serviceConfigModule.getServiceConfig();
    expect(serviceConfig).toBeUndefined();
  });

  it('should return updated service config', function () {
    const updatedConfig = {
      version: 'test',
      config: {},
    } as unknown as ServiceConfig;
    serviceConfigModule.updateServiceConfig(updatedConfig);

    expect(serviceConfigModule.getServiceConfig()).toBe(updatedConfig);
  });

  it('should return undefined initially - no matter the test order', function () {
    const serviceConfig = serviceConfigModule.getServiceConfig();
    expect(serviceConfig).toBeUndefined();
  });

  it('should notify about updated service', function () {
    const listener = vi.fn();

    serviceConfigModule.addServiceConfigListener(listener);

    const updatedConfig = {
      version: 'test',
      config: {},
    } as unknown as ServiceConfig;
    serviceConfigModule.updateServiceConfig(updatedConfig);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({
      initialized: true,
      data: updatedConfig,
    });
  });

  it('should notify all listeners about updated service', function () {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    serviceConfigModule.addServiceConfigListener(listener1);
    serviceConfigModule.addServiceConfigListener(listener2);

    const updatedConfig = {
      version: 'test',
      config: {},
    } as unknown as ServiceConfig;
    serviceConfigModule.updateServiceConfig(updatedConfig);

    expect(listener1).toHaveBeenCalledOnce();
    expect(listener1).toHaveBeenCalledWith({
      initialized: true,
      data: updatedConfig,
    });

    expect(listener2).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledWith({
      initialized: true,
      data: updatedConfig,
    });
  });

  it('should stop notifying after listener unsubscribes', function () {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 =
      serviceConfigModule.addServiceConfigListener(listener1);
    serviceConfigModule.addServiceConfigListener(listener2);

    const updatedConfig1 = {
      version: 'test',
      config: {},
    } as unknown as ServiceConfig;
    serviceConfigModule.updateServiceConfig(updatedConfig1);

    expect(listener1).toHaveBeenCalledOnce();
    expect(listener1).toHaveBeenCalledWith({
      initialized: true,
      data: updatedConfig1,
    });

    expect(listener2).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledWith({
      initialized: true,
      data: updatedConfig1,
    });

    listener1.mockClear();
    listener2.mockClear();

    unsubscribe1();

    const updatedConfig2 = {
      version: 'test2',
      config: {},
    } as unknown as ServiceConfig;
    serviceConfigModule.updateServiceConfig(updatedConfig2);

    expect(listener1).not.toHaveBeenCalled();

    expect(listener2).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledWith({
      initialized: true,
      data: updatedConfig2,
    });
  });

  it('should not fail when unsubscribing a listener multiple times', function () {
    const listener = vi.fn();

    const unsubscribe = serviceConfigModule.addServiceConfigListener(listener);

    expect(unsubscribe).not.toThrow();
    expect(unsubscribe).not.toThrow();
  });
});
