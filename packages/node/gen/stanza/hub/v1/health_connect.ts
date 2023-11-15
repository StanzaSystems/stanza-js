// @generated by protoc-gen-connect-es v0.13.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/health.proto (package stanza.hub.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import {
  QueryGuardHealthRequest,
  QueryGuardHealthResponse,
} from './health_pb.js';
import { MethodKind } from '@bufbuild/protobuf';

/**
 * The Health service definition. This service is used by the Stanza SDK to allow devs to
 *   make decisions about graceful degradation strategies to apply and to make decisions
 *   about fail-fast as high up the stack as possible.
 * "Keys" - API bearer tokens - are not included in API and should be sent via a X-Stanza-Key header.
 * Customer IDs are determined based on the X-Stanza-Key header (each key is associated
 * with one and only one customer).
 * However, env must always be specified - stanza keys do not have to be
 * specific to an environment, so we cannot infer the env from the key.
 * Like quota service this should be accessed by SDK via HTTPS.
 *
 * @generated from service stanza.hub.v1.HealthService
 */
export const HealthService = {
  typeName: 'stanza.hub.v1.HealthService',
  methods: {
    /**
     * @generated from rpc stanza.hub.v1.HealthService.QueryGuardHealth
     */
    queryGuardHealth: {
      name: 'QueryGuardHealth',
      I: QueryGuardHealthRequest,
      O: QueryGuardHealthResponse,
      kind: MethodKind.Unary,
    },
  },
} as const;
