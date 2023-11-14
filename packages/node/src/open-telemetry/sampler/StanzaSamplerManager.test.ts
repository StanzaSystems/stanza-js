import { ROOT_CONTEXT } from '@opentelemetry/api'
import { AlwaysOffSampler } from '@opentelemetry/sdk-trace-node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type getGuardConfig } from '../../global/guardConfig'
import {
  type getServiceConfig,
  type ServiceConfigListener
} from '../../global/serviceConfig'
import { type ServiceConfig } from '../../hub/model'
import { StanzaSamplerManager } from './StanzaSamplerManager'
import { addStanzaGuardToContext } from '../../context/guard'
import { StanzaConfiguredSampler } from './StanzaConfiguredSampler'

let serviceListener: ServiceConfigListener

type GetServiceConfig = typeof getServiceConfig
type GetGuardConfig = typeof getGuardConfig
const getServiceConfigMock = vi.fn<
  Parameters<GetServiceConfig>,
  ReturnType<GetServiceConfig>
>()
const getGuardConfigMock = vi.fn<
  Parameters<GetGuardConfig>,
  ReturnType<GetGuardConfig>
>()
vi.mock('../../global/serviceConfig', () => {
  return {
    getServiceConfig: ((...args) =>
      getServiceConfigMock(...args)) satisfies GetServiceConfig,
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
  getGuardConfigMock.mockReset()
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

      serviceListener({ initialized: true, data: mockServiceConfig })

      const sampler = manager.getSampler(ROOT_CONTEXT)
      expect(sampler).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      )
    })

    it('should return service sampler if service config is initialized before creating the manager', function () {
      getServiceConfigMock.mockImplementationOnce(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const sampler = manager.getSampler(ROOT_CONTEXT)
      expect(sampler).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      )
    })

    it('should return updated service sampler after service config is updated', function () {
      getServiceConfigMock.mockImplementation(() => mockServiceConfig)

      const manager = new StanzaSamplerManager()

      const sampler1 = manager.getSampler(ROOT_CONTEXT)
      expect(sampler1).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      )

      serviceListener({ initialized: true, data: secondMockServiceConfig })

      const sampler2 = manager.getSampler(ROOT_CONTEXT)
      expect(sampler2).toEqual(
        new StanzaConfiguredSampler(secondMockServiceConfig.config)
      )
    })
  })

  describe('context with guard', () => {
    it('should return AlwaysOffSampler if service config is not initialized', function () {
      const manager = new StanzaSamplerManager()

      expect(
        manager.getSampler(addStanzaGuardToContext('myGuard')(ROOT_CONTEXT))
      ).toBeInstanceOf(AlwaysOffSampler)
    })

    it('should return service processor if service config is initialized', function () {
      const manager = new StanzaSamplerManager()

      serviceListener({ initialized: true, data: mockServiceConfig })

      const sampler = manager.getSampler(
        addStanzaGuardToContext('myGuard')(ROOT_CONTEXT)
      )
      expect(sampler).toEqual(
        new StanzaConfiguredSampler(mockServiceConfig.config)
      )
    })
  })
})
