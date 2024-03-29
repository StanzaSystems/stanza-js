// @generated by protoc-gen-connect-es v0.13.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/usage.proto (package stanza.hub.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { GetUsageRequest, GetUsageResponse } from './usage_pb.js';
import { MethodKind } from '@bufbuild/protobuf';

/**
 * Used to get statistics on usage from Stanza, sliced and diced in various ways.
 *
 * @generated from service stanza.hub.v1.UsageService
 */
export const UsageService = {
  typeName: 'stanza.hub.v1.UsageService',
  methods: {
    /**
     * @generated from rpc stanza.hub.v1.UsageService.GetUsage
     */
    getUsage: {
      name: 'GetUsage',
      I: GetUsageRequest,
      O: GetUsageResponse,
      kind: MethodKind.Unary,
    },
  },
} as const;
