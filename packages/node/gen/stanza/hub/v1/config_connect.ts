// @generated by protoc-gen-connect-es v0.13.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/config.proto (package stanza.hub.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import {
  GetBrowserContextRequest,
  GetBrowserContextResponse,
  GetGuardConfigRequest,
  GetGuardConfigResponse,
  GetServiceConfigRequest,
  GetServiceConfigResponse
} from './config_pb.js'
import { MethodKind } from '@bufbuild/protobuf'

/**
 * The Config service definition.
 * This service is used by the Stanza SDK to get Service and Guard configs.
 * This service is used by the Browser SDK to get Browser Contexts.
 *
 * @generated from service stanza.hub.v1.ConfigService
 */
export const ConfigService = {
  typeName: 'stanza.hub.v1.ConfigService',
  methods: {
    /**
     * @generated from rpc stanza.hub.v1.ConfigService.GetGuardConfig
     */
    getGuardConfig: {
      name: 'GetGuardConfig',
      I: GetGuardConfigRequest,
      O: GetGuardConfigResponse,
      kind: MethodKind.Unary
    },
    /**
     * @generated from rpc stanza.hub.v1.ConfigService.GetBrowserContext
     */
    getBrowserContext: {
      name: 'GetBrowserContext',
      I: GetBrowserContextRequest,
      O: GetBrowserContextResponse,
      kind: MethodKind.Unary
    },
    /**
     * @generated from rpc stanza.hub.v1.ConfigService.GetServiceConfig
     */
    getServiceConfig: {
      name: 'GetServiceConfig',
      I: GetServiceConfigRequest,
      O: GetServiceConfigResponse,
      kind: MethodKind.Unary
    }
  }
} as const
