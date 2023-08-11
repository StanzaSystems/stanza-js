import { ROOT_CONTEXT } from '@opentelemetry/api'
import { AlwaysOffSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { stanzaGuardContextKey } from '../../context/stanzaGuardContextKey'
import { type getGuardConfig } from '../../global/guardConfig'
import { type getServiceConfig, type ServiceConfigListener } from '../../global/serviceConfig'
import { type ServiceConfig } from '../../hub/model'
import { StanzaSamplerManager } from './StanzaSamplerManager'

let serviceListener: ServiceConfigListener

type GetServiceConfig = typeof getServiceConfig
type GetDecoratorConfig = typeof getGuardConfig
const getServiceConfigMock = vi.fn<Parameters<GetServiceConfig>, ReturnType<GetServiceConfig>>()
const getDecoratorConfigMock = vi.fn<Parameters<GetDecoratorConfig>, ReturnType<GetDecoratorConfig>>()
vi.mock('../../global/serviceConfig', () => {
  return {
    getServiceConfig: ((...args) => getServiceConfigMock(...args)) satisfies GetServiceConfig,
    addServiceConfigListener: (newListener: ServiceConfigListener) => {
      serviceListener = newListener
    }
  }
})

const mockServiceConfig = {
  version: 'test',
  config: {
    traceConfig: {
      collectorUrl: 'https://test.collector',
      sampleRateDefault: 1,
      overrides: []
    }
  }
} as unknown as ServiceConfig

const secondMockServiceConfig = {
  version: 'test2',
  config: {
    traceConfig: {
      collectorUrl: 'https://test2.collector',
      sampleRateDefault: 0.9,
      overrides: []
    }
  }
} as unknown as ServiceConfig

beforeEach(async () => {
  getServiceConfigMock.mockReset()
  getDecoratorConfigMock.mockReset()
})

describe('StanzaSamplerManager', function () {
  it('should create StanzaSamplerManager', function () {
    expect(() => new StanzaSamplerManager()).not.toThrow()
  })

  describe('empty context', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager()

      expect(manager.getSampler(ROOT_CONTEXT)).toBeInstanceOf(AlwaysOffSampler)
    })

    it('should return service sampler if service config is initialized', function () {
      const manager = new StanzaSamplerManager()

      serviceListener(mockServiceConfig)

      const sampler = manager.getSampler(ROOT_CONTEXT)
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(1))
    })

    it('should return service sampler if service config is initialized before creating the manager', function () {
      getServiceConfigMock.mockImplementationOnce(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const sampler = manager.getSampler(ROOT_CONTEXT)
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(1))
    })

    it('should return updated service sampler after service config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const sampler1 = manager.getSampler(ROOT_CONTEXT)
      expect(sampler1).toEqual(new TraceIdRatioBasedSampler(1))

      serviceListener(secondMockServiceConfig)

      const sampler2 = manager.getSampler(ROOT_CONTEXT)
      expect(sampler2).toEqual(new TraceIdRatioBasedSampler(0.9))
    })
  })

  describe('context with decorator', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager()

      expect(manager.getSampler(ROOT_CONTEXT.setValue(stanzaGuardContextKey, 'myDecorator'))).toBeInstanceOf(AlwaysOffSampler)
    })

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSamplerManager()

      serviceListener(mockServiceConfig)

      const sampler = manager.getSampler(ROOT_CONTEXT.setValue(stanzaGuardContextKey, 'myDecorator'))
      expect(sampler).toEqual(new TraceIdRatioBasedSampler(1))
    })
  })
})
