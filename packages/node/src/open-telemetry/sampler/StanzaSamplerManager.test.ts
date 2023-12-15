import { ROOT_CONTEXT } from '@opentelemetry/api';
import { AlwaysOffSampler } from '@opentelemetry/sdk-trace-base';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  addStanzaGuardToContext,
  updateServiceConfig,
  resetServiceConfig,
} from '@getstanza/sdk-base';
import { type ServiceConfig } from '@getstanza/hub-client-api';
import { StanzaSamplerManager } from './StanzaSamplerManager';
import { StanzaConfiguredSampler } from './StanzaConfiguredSampler';

const mockServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: [],
    },
  },
} as unknown as ServiceConfig;

const secondMockServiceConfig = {
  version: 'test2',
  config: {
    traceConfig: {
      collectorUrl: 'https://test2.collector',
      sampleRateDefault: 0.9,
      overrides: [],
    },
  },
} as unknown as ServiceConfig;

beforeEach(async () => {
  resetServiceConfig();
});

describe('StanzaSamplerManager', function () {
  it('should create StanzaSamplerManager', function () {
    expect(() => new StanzaSamplerManager()).not.toThrow();
  });

  describe('empty context', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager();

      expect(manager.getSampler(ROOT_CONTEXT)).toBeInstanceOf(AlwaysOffSampler);
    });

    it('should return service sampler if service config is initialized', function () {
      const manager = new StanzaSamplerManager();

      updateServiceConfig(mockServiceConfig);

      const sampler = manager.getSampler(ROOT_CONTEXT);
      expect(sampler).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      );
    });

    it('should return service sampler if service config is initialized before creating the manager', function () {
      updateServiceConfig(mockServiceConfig);

      const manager = new StanzaSamplerManager();

      const sampler = manager.getSampler(ROOT_CONTEXT);
      expect(sampler).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      );
    });

    it('should return updated service sampler after service config is updated', function () {
      updateServiceConfig(mockServiceConfig);

      const manager = new StanzaSamplerManager();

      const sampler1 = manager.getSampler(ROOT_CONTEXT);
      expect(sampler1).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      );

      updateServiceConfig(secondMockServiceConfig);

      const sampler2 = manager.getSampler(ROOT_CONTEXT);
      expect(sampler2).toEqual(
        new StanzaConfiguredSampler(secondMockServiceConfig.config)
      );
    });
  });

  describe('context with guard', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager();

      expect(
        manager.getSampler(addStanzaGuardToContext('myGuard')(ROOT_CONTEXT))
      ).toBeInstanceOf(AlwaysOffSampler);
    });

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSamplerManager();

      updateServiceConfig(mockServiceConfig);

      const sampler = manager.getSampler(
        addStanzaGuardToContext('myGuard')(ROOT_CONTEXT)
      );
      expect(sampler).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      );
    });
  });
});
