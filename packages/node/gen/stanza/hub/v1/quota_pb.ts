// @generated by protoc-gen-es v1.4.1 with parameter "target=ts"
// @generated from file stanza/hub/v1/quota.proto (package stanza.hub.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type {
  BinaryReadOptions,
  FieldList,
  JsonReadOptions,
  JsonValue,
  PartialMessage,
  PlainMessage,
} from '@bufbuild/protobuf';
import { Message, proto3, Timestamp } from '@bufbuild/protobuf';
import { GuardFeatureSelector, GuardSelector, Mode } from './common_pb.js';

/**
 * @generated from enum stanza.hub.v1.Reason
 */
export enum Reason {
  /**
   * @generated from enum value: REASON_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: REASON_SUFFICIENT_QUOTA = 1;
   */
  SUFFICIENT_QUOTA = 1,

  /**
   * @generated from enum value: REASON_INSUFFICIENT_QUOTA = 2;
   */
  INSUFFICIENT_QUOTA = 2,

  /**
   * @generated from enum value: REASON_INSUFFICIENT_QUOTA_PARENT = 3;
   */
  INSUFFICIENT_QUOTA_PARENT = 3,

  /**
   * @generated from enum value: REASON_BURST = 4;
   */
  BURST = 4,

  /**
   * @generated from enum value: REASON_BEST_EFFORT = 5;
   */
  BEST_EFFORT = 5,
}
// Retrieve enum metadata with: proto3.getEnumType(Reason)
proto3.util.setEnumType(Reason, 'stanza.hub.v1.Reason', [
  { no: 0, name: 'REASON_UNSPECIFIED' },
  { no: 1, name: 'REASON_SUFFICIENT_QUOTA' },
  { no: 2, name: 'REASON_INSUFFICIENT_QUOTA' },
  { no: 3, name: 'REASON_INSUFFICIENT_QUOTA_PARENT' },
  { no: 4, name: 'REASON_BURST' },
  { no: 5, name: 'REASON_BEST_EFFORT' },
]);

/**
 * Requests token for given Guard at priority of specified feature.
 *
 * @generated from message stanza.hub.v1.GetTokenRequest
 */
export class GetTokenRequest extends Message<GetTokenRequest> {
  /**
   * Only tags which are used for quota management should be included here - i.e. the list of quota_tags returned by the GetGuardConfig endpoint for this Guard. If tags are in use only one quota token will be issued at a time.
   *
   * @generated from field: stanza.hub.v1.GuardFeatureSelector selector = 1;
   */
  selector?: GuardFeatureSelector;

  /**
   * Used for tracking per-client token usage, allowing automatic determination of efficient batch leases. ID should be assigned by Stanza clients and be unique per-customer. Host or instance names may be used, or a UUID.
   * It is important that this value be stable over the lifetime of an instance: if it changes, then Stanza will not be able to efficiently assign batches of tokens.
   *
   * @generated from field: optional string client_id = 4;
   */
  clientId?: string;

  /**
   * Used to increase or decrease priority of request, relative to normal feature priority.
   *
   * @generated from field: optional int32 priority_boost = 5;
   */
  priorityBoost?: number;

  /**
   * Used for request weighting, i.e. accounting for varying request sizes and costs. If not specified then a default value of 1 is used. In cases where weights/costs are not known upfront, users can send an initial estimate as the weight, and then later, when the exact cost is known, send an updated weight via the SetTokenLeaseConsumed rpc.
   *
   * weight is optional; if not used then it is assumed that all requests have weight of 1.
   *
   * @generated from field: optional float weight = 7;
   */
  weight?: number;

  constructor(data?: PartialMessage<GetTokenRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetTokenRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'selector', kind: 'message', T: GuardFeatureSelector },
    {
      no: 4,
      name: 'client_id',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 5,
      name: 'priority_boost',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    {
      no: 7,
      name: 'weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetTokenRequest {
    return new GetTokenRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetTokenRequest {
    return new GetTokenRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetTokenRequest {
    return new GetTokenRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetTokenRequest | PlainMessage<GetTokenRequest> | undefined,
    b: GetTokenRequest | PlainMessage<GetTokenRequest> | undefined,
  ): boolean {
    return proto3.util.equals(GetTokenRequest, a, b);
  }
}

/**
 * Specifies whether token granted.
 *
 * @generated from message stanza.hub.v1.GetTokenResponse
 */
export class GetTokenResponse extends Message<GetTokenResponse> {
  /**
   * @generated from field: bool granted = 1;
   */
  granted = false;

  /**
   * @generated from field: optional string token = 2;
   */
  token?: string;

  /**
   * @generated from field: optional stanza.hub.v1.Reason reason = 3;
   */
  reason?: Reason;

  /**
   * @generated from field: optional stanza.hub.v1.Mode mode = 4;
   */
  mode?: Mode;

  constructor(data?: PartialMessage<GetTokenResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetTokenResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'granted', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
    {
      no: 2,
      name: 'token',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 3,
      name: 'reason',
      kind: 'enum',
      T: proto3.getEnumType(Reason),
      opt: true,
    },
    {
      no: 4,
      name: 'mode',
      kind: 'enum',
      T: proto3.getEnumType(Mode),
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetTokenResponse {
    return new GetTokenResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetTokenResponse {
    return new GetTokenResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetTokenResponse {
    return new GetTokenResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetTokenResponse | PlainMessage<GetTokenResponse> | undefined,
    b: GetTokenResponse | PlainMessage<GetTokenResponse> | undefined,
  ): boolean {
    return proto3.util.equals(GetTokenResponse, a, b);
  }
}

/**
 * Requests token lease for given Guard at priority of specified feature.
 *
 * @generated from message stanza.hub.v1.GetTokenLeaseRequest
 */
export class GetTokenLeaseRequest extends Message<GetTokenLeaseRequest> {
  /**
   * Only tags which are used for quota management should be included here - i.e. the list of quota_tags returned by the GetGuardConfig endpoint for this Guard. If tags are in use only one quota token will be issued at a time.
   *
   * @generated from field: stanza.hub.v1.GuardFeatureSelector selector = 1;
   */
  selector?: GuardFeatureSelector;

  /**
   * Used for tracking per-client token usage, allowing automatic determination of efficient batch leases. ID should be assigned by Stanza clients and be unique per-customer. Host or instance names may be used, or a UUID.
   * It is important that this value be stable over the lifetime of an instance: if it changes, then Stanza will not be able to efficiently assign batches of tokens.
   *
   * @generated from field: optional string client_id = 4;
   */
  clientId?: string;

  /**
   * Used to boost priority - SDK can increase or decrease priority of request, relative to normal feature priority. For instance, a customer may wish to boost the priority of paid user traffic over free tier. Priority boosts may also be negative - for example, one might deprioritise bot traffic.
   *
   * @generated from field: optional int32 priority_boost = 5;
   */
  priorityBoost?: number;

  /**
   * Used for request weighting, i.e. accounting for varying request sizes and costs. The value set here is the default request weight which should be assumed for leases. If not specified, then the median weight is used when granted leases. Actual weights should be set via the SetTokenLeaseConsumed rpc.
   *
   * default_weight is optional; if not used then it is assumed that all requests have weight of 1.
   *
   * @generated from field: optional float default_weight = 7;
   */
  defaultWeight?: number;

  constructor(data?: PartialMessage<GetTokenLeaseRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetTokenLeaseRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'selector', kind: 'message', T: GuardFeatureSelector },
    {
      no: 4,
      name: 'client_id',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 5,
      name: 'priority_boost',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    {
      no: 7,
      name: 'default_weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetTokenLeaseRequest {
    return new GetTokenLeaseRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetTokenLeaseRequest {
    return new GetTokenLeaseRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetTokenLeaseRequest {
    return new GetTokenLeaseRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetTokenLeaseRequest | PlainMessage<GetTokenLeaseRequest> | undefined,
    b: GetTokenLeaseRequest | PlainMessage<GetTokenLeaseRequest> | undefined,
  ): boolean {
    return proto3.util.equals(GetTokenLeaseRequest, a, b);
  }
}

/**
 * Specifies tokens granted and their duration (may be empty if none granted)
 *
 * @generated from message stanza.hub.v1.GetTokenLeaseResponse
 */
export class GetTokenLeaseResponse extends Message<GetTokenLeaseResponse> {
  /**
   * @generated from field: bool granted = 1;
   */
  granted = false;

  /**
   * @generated from field: repeated stanza.hub.v1.TokenLease leases = 2;
   */
  leases: TokenLease[] = [];

  constructor(data?: PartialMessage<GetTokenLeaseResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetTokenLeaseResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'granted', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
    { no: 2, name: 'leases', kind: 'message', T: TokenLease, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetTokenLeaseResponse {
    return new GetTokenLeaseResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetTokenLeaseResponse {
    return new GetTokenLeaseResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetTokenLeaseResponse {
    return new GetTokenLeaseResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetTokenLeaseResponse | PlainMessage<GetTokenLeaseResponse> | undefined,
    b: GetTokenLeaseResponse | PlainMessage<GetTokenLeaseResponse> | undefined,
  ): boolean {
    return proto3.util.equals(GetTokenLeaseResponse, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.TokenLease
 */
export class TokenLease extends Message<TokenLease> {
  /**
   * How long until lease expires, in milliseconds
   *
   * @generated from field: int32 duration_msec = 1;
   */
  durationMsec = 0;

  /**
   * @generated from field: string token = 2;
   */
  token = '';

  /**
   * @generated from field: string feature = 3;
   */
  feature = '';

  /**
   * @generated from field: int32 priority_boost = 4;
   */
  priorityBoost = 0;

  /**
   * @generated from field: float weight = 5;
   */
  weight = 0;

  /**
   * @generated from field: stanza.hub.v1.Reason reason = 6;
   */
  reason = Reason.UNSPECIFIED;

  /**
   * If nil expiration should be calculated as time you received the lease + duration_msec
   *
   * @generated from field: optional google.protobuf.Timestamp expires_at = 7;
   */
  expiresAt?: Timestamp;

  /**
   * @generated from field: optional stanza.hub.v1.Mode mode = 8;
   */
  mode?: Mode;

  constructor(data?: PartialMessage<TokenLease>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.TokenLease';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'duration_msec',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
    },
    { no: 2, name: 'token', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 3, name: 'feature', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 4,
      name: 'priority_boost',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
    },
    { no: 5, name: 'weight', kind: 'scalar', T: 2 /* ScalarType.FLOAT */ },
    { no: 6, name: 'reason', kind: 'enum', T: proto3.getEnumType(Reason) },
    { no: 7, name: 'expires_at', kind: 'message', T: Timestamp, opt: true },
    {
      no: 8,
      name: 'mode',
      kind: 'enum',
      T: proto3.getEnumType(Mode),
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): TokenLease {
    return new TokenLease().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): TokenLease {
    return new TokenLease().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): TokenLease {
    return new TokenLease().fromJsonString(jsonString, options);
  }

  static equals(
    a: TokenLease | PlainMessage<TokenLease> | undefined,
    b: TokenLease | PlainMessage<TokenLease> | undefined,
  ): boolean {
    return proto3.util.equals(TokenLease, a, b);
  }
}

/**
 * Notifies Hub that one or more token leases has been used, i.e. Guard has been exercised.
 *
 * @generated from message stanza.hub.v1.SetTokenLeaseConsumedRequest
 */
export class SetTokenLeaseConsumedRequest extends Message<SetTokenLeaseConsumedRequest> {
  /**
   * @generated from field: repeated string tokens = 1;
   */
  tokens: string[] = [];

  /**
   * Used for request weighting, i.e. accounting for varying request sizes and costs. If weights are not known before request execution, then a default or estimated weight may be used, followed by a corrected value here. If a value is sent here, it should be the actual request weight.
   *
   * @generated from field: optional float weight_correction = 2;
   */
  weightCorrection?: number;

  /**
   * Must be specified.
   *
   * @generated from field: string environment = 3;
   */
  environment = '';

  constructor(data?: PartialMessage<SetTokenLeaseConsumedRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.SetTokenLeaseConsumedRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'tokens',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
    {
      no: 2,
      name: 'weight_correction',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
      opt: true,
    },
    {
      no: 3,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): SetTokenLeaseConsumedRequest {
    return new SetTokenLeaseConsumedRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): SetTokenLeaseConsumedRequest {
    return new SetTokenLeaseConsumedRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): SetTokenLeaseConsumedRequest {
    return new SetTokenLeaseConsumedRequest().fromJsonString(
      jsonString,
      options,
    );
  }

  static equals(
    a:
      | SetTokenLeaseConsumedRequest
      | PlainMessage<SetTokenLeaseConsumedRequest>
      | undefined,
    b:
      | SetTokenLeaseConsumedRequest
      | PlainMessage<SetTokenLeaseConsumedRequest>
      | undefined,
  ): boolean {
    return proto3.util.equals(SetTokenLeaseConsumedRequest, a, b);
  }
}

/**
 * No message contents yet
 *
 * @generated from message stanza.hub.v1.SetTokenLeaseConsumedResponse
 */
export class SetTokenLeaseConsumedResponse extends Message<SetTokenLeaseConsumedResponse> {
  constructor(data?: PartialMessage<SetTokenLeaseConsumedResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.SetTokenLeaseConsumedResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => []);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): SetTokenLeaseConsumedResponse {
    return new SetTokenLeaseConsumedResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): SetTokenLeaseConsumedResponse {
    return new SetTokenLeaseConsumedResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): SetTokenLeaseConsumedResponse {
    return new SetTokenLeaseConsumedResponse().fromJsonString(
      jsonString,
      options,
    );
  }

  static equals(
    a:
      | SetTokenLeaseConsumedResponse
      | PlainMessage<SetTokenLeaseConsumedResponse>
      | undefined,
    b:
      | SetTokenLeaseConsumedResponse
      | PlainMessage<SetTokenLeaseConsumedResponse>
      | undefined,
  ): boolean {
    return proto3.util.equals(SetTokenLeaseConsumedResponse, a, b);
  }
}

/**
 * Calls Hub to validate a token (ensures token has not expired, was minted by Hub, and related to the specified Guard). Used from Ingress Guards. Ensures callers have acquired quota prior to expending resources.
 *
 * @generated from message stanza.hub.v1.ValidateTokenRequest
 */
export class ValidateTokenRequest extends Message<ValidateTokenRequest> {
  /**
   * @generated from field: repeated stanza.hub.v1.TokenInfo tokens = 1;
   */
  tokens: TokenInfo[] = [];

  constructor(data?: PartialMessage<ValidateTokenRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.ValidateTokenRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'tokens', kind: 'message', T: TokenInfo, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): ValidateTokenRequest {
    return new ValidateTokenRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): ValidateTokenRequest {
    return new ValidateTokenRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): ValidateTokenRequest {
    return new ValidateTokenRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: ValidateTokenRequest | PlainMessage<ValidateTokenRequest> | undefined,
    b: ValidateTokenRequest | PlainMessage<ValidateTokenRequest> | undefined,
  ): boolean {
    return proto3.util.equals(ValidateTokenRequest, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.TokenInfo
 */
export class TokenInfo extends Message<TokenInfo> {
  /**
   * @generated from field: string token = 1;
   */
  token = '';

  /**
   * @generated from field: stanza.hub.v1.GuardSelector guard = 2;
   */
  guard?: GuardSelector;

  constructor(data?: PartialMessage<TokenInfo>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.TokenInfo';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'token', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 2, name: 'guard', kind: 'message', T: GuardSelector },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): TokenInfo {
    return new TokenInfo().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): TokenInfo {
    return new TokenInfo().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): TokenInfo {
    return new TokenInfo().fromJsonString(jsonString, options);
  }

  static equals(
    a: TokenInfo | PlainMessage<TokenInfo> | undefined,
    b: TokenInfo | PlainMessage<TokenInfo> | undefined,
  ): boolean {
    return proto3.util.equals(TokenInfo, a, b);
  }
}

/**
 * Specifies whether tokens were valid or not.
 *
 * @generated from message stanza.hub.v1.ValidateTokenResponse
 */
export class ValidateTokenResponse extends Message<ValidateTokenResponse> {
  /**
   * Unused, does not work in batch mode, will remove in V1 API
   *
   * @generated from field: bool valid = 1;
   */
  valid = false;

  /**
   * @generated from field: repeated stanza.hub.v1.TokenValid tokens_valid = 2;
   */
  tokensValid: TokenValid[] = [];

  constructor(data?: PartialMessage<ValidateTokenResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.ValidateTokenResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'valid', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
    {
      no: 2,
      name: 'tokens_valid',
      kind: 'message',
      T: TokenValid,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): ValidateTokenResponse {
    return new ValidateTokenResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): ValidateTokenResponse {
    return new ValidateTokenResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): ValidateTokenResponse {
    return new ValidateTokenResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a: ValidateTokenResponse | PlainMessage<ValidateTokenResponse> | undefined,
    b: ValidateTokenResponse | PlainMessage<ValidateTokenResponse> | undefined,
  ): boolean {
    return proto3.util.equals(ValidateTokenResponse, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.TokenValid
 */
export class TokenValid extends Message<TokenValid> {
  /**
   * @generated from field: string token = 1;
   */
  token = '';

  /**
   * @generated from field: bool valid = 2;
   */
  valid = false;

  constructor(data?: PartialMessage<TokenValid>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.TokenValid';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'token', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 2, name: 'valid', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): TokenValid {
    return new TokenValid().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): TokenValid {
    return new TokenValid().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): TokenValid {
    return new TokenValid().fromJsonString(jsonString, options);
  }

  static equals(
    a: TokenValid | PlainMessage<TokenValid> | undefined,
    b: TokenValid | PlainMessage<TokenValid> | undefined,
  ): boolean {
    return proto3.util.equals(TokenValid, a, b);
  }
}
