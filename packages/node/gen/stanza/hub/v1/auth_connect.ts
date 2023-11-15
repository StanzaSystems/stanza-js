// @generated by protoc-gen-connect-es v0.13.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/auth.proto (package stanza.hub.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { GetBearerTokenRequest, GetBearerTokenResponse } from './auth_pb.js';
import { MethodKind } from '@bufbuild/protobuf';

/**
 * @generated from service stanza.hub.v1.AuthService
 */
export const AuthService = {
  typeName: 'stanza.hub.v1.AuthService',
  methods: {
    /**
     * @generated from rpc stanza.hub.v1.AuthService.GetBearerToken
     */
    getBearerToken: {
      name: 'GetBearerToken',
      I: GetBearerTokenRequest,
      O: GetBearerTokenResponse,
      kind: MethodKind.Unary,
    },
  },
} as const;
