// @generated by protoc-gen-connect-es v0.9.1 with parameter "target=ts"
// @generated from file stanza/hub/v1/quota.proto (package stanza.hub.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { GetTokenLeaseRequest, GetTokenLeaseResponse, GetTokenRequest, GetTokenResponse, SetTokenLeaseConsumedRequest, SetTokenLeaseConsumedResponse, ValidateTokenRequest, ValidateTokenResponse } from "./quota_pb.js";
import { MethodKind } from "@bufbuild/protobuf";

/**
 * The Quota service definition. This service is used by the Stanza and Browser SDKs to determine whether quota is available to use services which are subject to centralised ratelimiting.
 * "Keys" are not included in API and should be sent via a X-Stanza-Key header.
 * Customer IDs are determined based on the X-Stanza-Key header (each key is associated with one and only one customer). However, environment must always be specified when requesting a token - Stanza keys do not have to be specific to an environment, so we cannot infer that from the key alone.
 *
 * @generated from service stanza.hub.v1.QuotaService
 */
export const QuotaService = {
  typeName: "stanza.hub.v1.QuotaService",
  methods: {
    /**
     * @generated from rpc stanza.hub.v1.QuotaService.GetToken
     */
    getToken: {
      name: "GetToken",
      I: GetTokenRequest,
      O: GetTokenResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc stanza.hub.v1.QuotaService.GetTokenLease
     */
    getTokenLease: {
      name: "GetTokenLease",
      I: GetTokenLeaseRequest,
      O: GetTokenLeaseResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc stanza.hub.v1.QuotaService.SetTokenLeaseConsumed
     */
    setTokenLeaseConsumed: {
      name: "SetTokenLeaseConsumed",
      I: SetTokenLeaseConsumedRequest,
      O: SetTokenLeaseConsumedResponse,
      kind: MethodKind.Unary,
    },
    /**
     * Used by ingress decorators to validate Hub-generated tokens.
     *
     * @generated from rpc stanza.hub.v1.QuotaService.ValidateToken
     */
    validateToken: {
      name: "ValidateToken",
      I: ValidateTokenRequest,
      O: ValidateTokenResponse,
      kind: MethodKind.Unary,
    },
  }
} as const;

