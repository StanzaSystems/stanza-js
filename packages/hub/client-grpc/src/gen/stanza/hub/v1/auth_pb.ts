// @generated by protoc-gen-es v1.6.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/auth.proto (package stanza.hub.v1, syntax proto3)
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
import { Message, proto3 } from '@bufbuild/protobuf';

/**
 * GetBearerTokenRequest is empty, please pass your API key via a X-Stanza-Key header.
 *
 * @generated from message stanza.hub.v1.GetBearerTokenRequest
 */
export class GetBearerTokenRequest extends Message<GetBearerTokenRequest> {
  /**
   * Must be specified.
   *
   * @generated from field: string environment = 1;
   */
  environment = '';

  constructor(data?: PartialMessage<GetBearerTokenRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetBearerTokenRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GetBearerTokenRequest {
    return new GetBearerTokenRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GetBearerTokenRequest {
    return new GetBearerTokenRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GetBearerTokenRequest {
    return new GetBearerTokenRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetBearerTokenRequest | PlainMessage<GetBearerTokenRequest> | undefined,
    b: GetBearerTokenRequest | PlainMessage<GetBearerTokenRequest> | undefined
  ): boolean {
    return proto3.util.equals(GetBearerTokenRequest, a, b);
  }
}

/**
 * GetBearerTokenResponse is a new Bearer Token.
 *
 * @generated from message stanza.hub.v1.GetBearerTokenResponse
 */
export class GetBearerTokenResponse extends Message<GetBearerTokenResponse> {
  /**
   * @generated from field: string bearer_token = 1;
   */
  bearerToken = '';

  constructor(data?: PartialMessage<GetBearerTokenResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetBearerTokenResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'bearer_token',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GetBearerTokenResponse {
    return new GetBearerTokenResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GetBearerTokenResponse {
    return new GetBearerTokenResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GetBearerTokenResponse {
    return new GetBearerTokenResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a:
      | GetBearerTokenResponse
      | PlainMessage<GetBearerTokenResponse>
      | undefined,
    b: GetBearerTokenResponse | PlainMessage<GetBearerTokenResponse> | undefined
  ): boolean {
    return proto3.util.equals(GetBearerTokenResponse, a, b);
  }
}
