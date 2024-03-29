// @generated by protoc-gen-es v1.6.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/stream.proto (package stanza.hub.v1, syntax proto3)
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
import { Tag } from './common_pb.js';

/**
 * @generated from message stanza.hub.v1.UpdateStreamsRequest
 */
export class UpdateStreamsRequest extends Message<UpdateStreamsRequest> {
  /**
   * @generated from field: string guard_name = 1;
   */
  guardName = '';

  /**
   * @generated from field: string environment = 2;
   */
  environment = '';

  /**
   * @generated from field: repeated stanza.hub.v1.StreamRequest requests = 3;
   */
  requests: StreamRequest[] = [];

  /**
   * IDs of streams that have completed
   *
   * @generated from field: repeated string ended = 4;
   */
  ended: string[] = [];

  constructor(data?: PartialMessage<UpdateStreamsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.UpdateStreamsRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'guard_name', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 2,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    {
      no: 3,
      name: 'requests',
      kind: 'message',
      T: StreamRequest,
      repeated: true,
    },
    {
      no: 4,
      name: 'ended',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): UpdateStreamsRequest {
    return new UpdateStreamsRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): UpdateStreamsRequest {
    return new UpdateStreamsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): UpdateStreamsRequest {
    return new UpdateStreamsRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: UpdateStreamsRequest | PlainMessage<UpdateStreamsRequest> | undefined,
    b: UpdateStreamsRequest | PlainMessage<UpdateStreamsRequest> | undefined
  ): boolean {
    return proto3.util.equals(UpdateStreamsRequest, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.UpdateStreamsResponse
 */
export class UpdateStreamsResponse extends Message<UpdateStreamsResponse> {
  /**
   * @generated from field: repeated stanza.hub.v1.StreamResult results = 1;
   */
  results: StreamResult[] = [];

  constructor(data?: PartialMessage<UpdateStreamsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.UpdateStreamsResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'results',
      kind: 'message',
      T: StreamResult,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): UpdateStreamsResponse {
    return new UpdateStreamsResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): UpdateStreamsResponse {
    return new UpdateStreamsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): UpdateStreamsResponse {
    return new UpdateStreamsResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a: UpdateStreamsResponse | PlainMessage<UpdateStreamsResponse> | undefined,
    b: UpdateStreamsResponse | PlainMessage<UpdateStreamsResponse> | undefined
  ): boolean {
    return proto3.util.equals(UpdateStreamsResponse, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.StreamRequest
 */
export class StreamRequest extends Message<StreamRequest> {
  /**
   * optional - if specified then the request inherits the feature priority
   *
   * @generated from field: string feature = 1;
   */
  feature = '';

  /**
   * refers to tags specified in the Guard configuration, used to fairly allocate quota
   *
   * @generated from field: repeated stanza.hub.v1.Tag tags = 2;
   */
  tags: Tag[] = [];

  /**
   * optional - allows priority to be increased or reduced relative to normal default or feature priority.
   *
   * @generated from field: optional int32 priority_boost = 3;
   */
  priorityBoost?: number;

  /**
   * Unique identifier for this stream - may be meaningful or a UUID. Assigned by requestor.
   *
   * @generated from field: string stream_id = 4;
   */
  streamId = '';

  /**
   * Maximum weight that may be allocated to this stream
   *
   * @generated from field: float max_weight = 5;
   */
  maxWeight = 0;

  /**
   * Minimum weight that may be allocated to this stream. If this weight cannot be allocated then the stream cannot be served.
   *
   * @generated from field: float min_weight = 6;
   */
  minWeight = 0;

  constructor(data?: PartialMessage<StreamRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.StreamRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'feature', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 2, name: 'tags', kind: 'message', T: Tag, repeated: true },
    {
      no: 3,
      name: 'priority_boost',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    { no: 4, name: 'stream_id', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 5, name: 'max_weight', kind: 'scalar', T: 2 /* ScalarType.FLOAT */ },
    { no: 6, name: 'min_weight', kind: 'scalar', T: 2 /* ScalarType.FLOAT */ },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): StreamRequest {
    return new StreamRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): StreamRequest {
    return new StreamRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): StreamRequest {
    return new StreamRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: StreamRequest | PlainMessage<StreamRequest> | undefined,
    b: StreamRequest | PlainMessage<StreamRequest> | undefined
  ): boolean {
    return proto3.util.equals(StreamRequest, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.StreamResult
 */
export class StreamResult extends Message<StreamResult> {
  /**
   * Unique identifier for this stream - as described in StreamRequest mesage.
   *
   * @generated from field: string stream_id = 1;
   */
  streamId = '';

  /**
   * Weight allocated to this stream. Zero means it was not allocated.
   *
   * @generated from field: float allocated_weight = 2;
   */
  allocatedWeight = 0;

  constructor(data?: PartialMessage<StreamResult>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.StreamResult';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'stream_id', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 2,
      name: 'allocated_weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): StreamResult {
    return new StreamResult().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): StreamResult {
    return new StreamResult().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): StreamResult {
    return new StreamResult().fromJsonString(jsonString, options);
  }

  static equals(
    a: StreamResult | PlainMessage<StreamResult> | undefined,
    b: StreamResult | PlainMessage<StreamResult> | undefined
  ): boolean {
    return proto3.util.equals(StreamResult, a, b);
  }
}
