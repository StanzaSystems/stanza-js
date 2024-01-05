// @generated by protoc-gen-es v1.6.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/usage.proto (package stanza.hub.v1, syntax proto3)
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
import { Tag } from './common_pb.js';

/**
 * MODE_SUM: query results across various axes (features, tags, apikeys) are added up and one timeseries is returned.
 * MODE_REPORT: individual timeseries are returned for specified query axes.
 * If not specified then queries will default to MODE_SUM for all axes.
 *
 * @generated from enum stanza.hub.v1.QueryMode
 */
export enum QueryMode {
  /**
   * @generated from enum value: QUERY_MODE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: QUERY_MODE_SUM = 1;
   */
  SUM = 1,

  /**
   * @generated from enum value: QUERY_MODE_REPORT = 2;
   */
  REPORT = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(QueryMode)
proto3.util.setEnumType(QueryMode, 'stanza.hub.v1.QueryMode', [
  { no: 0, name: 'QUERY_MODE_UNSPECIFIED' },
  { no: 1, name: 'QUERY_MODE_SUM' },
  { no: 2, name: 'QUERY_MODE_REPORT' },
]);

/**
 * Usage query.
 *
 * @generated from message stanza.hub.v1.GetUsageRequest
 */
export class GetUsageRequest extends Message<GetUsageRequest> {
  /**
   * If specified, only stats relating to the tags and features in selector will be returned.
   *  If only guard and environment are specified, then stats relating to all tags and features will be returned.
   *
   * @generated from field: string environment = 1;
   */
  environment = '';

  /**
   * Query for stats for this specific guard. If not specified then stats for all guards are returned.
   *
   * @generated from field: optional string guard = 2;
   */
  guard?: string;

  /**
   * @generated from field: optional stanza.hub.v1.QueryMode guard_query_mode = 3;
   */
  guardQueryMode?: QueryMode;

  /**
   * @generated from field: google.protobuf.Timestamp start_ts = 4;
   */
  startTs?: Timestamp;

  /**
   * @generated from field: google.protobuf.Timestamp end_ts = 5;
   */
  endTs?: Timestamp;

  /**
   * Query for stats where this specific APIKey was used. If not specified then stats for all APIKeys are returned.
   *
   * @generated from field: optional string apikey = 6;
   */
  apikey?: string;

  /**
   * Query for stats about a specific feature. If not specified then stats for all features are returned.
   *
   * @generated from field: optional string feature = 7;
   */
  feature?: string;

  /**
   * @generated from field: optional stanza.hub.v1.QueryMode feature_query_mode = 8;
   */
  featureQueryMode?: QueryMode;

  /**
   * Query for stats about a specific service. If not specified then stats for all services are returned.
   * Note that Stanza can only track service statistics if client_id is used when requesting service configuration at startup, and sent with quota requests.
   *
   * @generated from field: optional string service = 15;
   */
  service?: string;

  /**
   * @generated from field: optional stanza.hub.v1.QueryMode service_query_mode = 16;
   */
  serviceQueryMode?: QueryMode;

  /**
   * Query for stats about a specific priority level. If not specified then stats for all priorities are returned.
   *
   * @generated from field: optional int32 priority = 9;
   */
  priority?: number;

  /**
   * @generated from field: optional stanza.hub.v1.QueryMode priority_query_mode = 10;
   */
  priorityQueryMode?: QueryMode;

  /**
   * Tags matching listed tag keys will be reported (individual timeseries returned for each value).
   *
   * @generated from field: repeated string report_tags = 11;
   */
  reportTags: string[] = [];

  /**
   * Only stats relating to the specified tags will be returned.
   *
   * @generated from field: repeated stanza.hub.v1.Tag tags = 12;
   */
  tags: Tag[] = [];

  /**
   * Report all tag values for all tags as separate timeseries. Overrides tags and report_tags params.
   *
   * @generated from field: optional bool report_all_tags = 13;
   */
  reportAllTags?: boolean;

  /**
   * 1m to 1w - m is minutes; h hours; d days; w weeks (7d). Defaults to a step that results in <100 results. Minimum step 1m.
   *
   * @generated from field: optional string step = 14;
   */
  step?: string;

  constructor(data?: PartialMessage<GetUsageRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetUsageRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    {
      no: 2,
      name: 'guard',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 3,
      name: 'guard_query_mode',
      kind: 'enum',
      T: proto3.getEnumType(QueryMode),
      opt: true,
    },
    { no: 4, name: 'start_ts', kind: 'message', T: Timestamp },
    { no: 5, name: 'end_ts', kind: 'message', T: Timestamp },
    {
      no: 6,
      name: 'apikey',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 7,
      name: 'feature',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 8,
      name: 'feature_query_mode',
      kind: 'enum',
      T: proto3.getEnumType(QueryMode),
      opt: true,
    },
    {
      no: 15,
      name: 'service',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 16,
      name: 'service_query_mode',
      kind: 'enum',
      T: proto3.getEnumType(QueryMode),
      opt: true,
    },
    {
      no: 9,
      name: 'priority',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    {
      no: 10,
      name: 'priority_query_mode',
      kind: 'enum',
      T: proto3.getEnumType(QueryMode),
      opt: true,
    },
    {
      no: 11,
      name: 'report_tags',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
    { no: 12, name: 'tags', kind: 'message', T: Tag, repeated: true },
    {
      no: 13,
      name: 'report_all_tags',
      kind: 'scalar',
      T: 8 /* ScalarType.BOOL */,
      opt: true,
    },
    {
      no: 14,
      name: 'step',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GetUsageRequest {
    return new GetUsageRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GetUsageRequest {
    return new GetUsageRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GetUsageRequest {
    return new GetUsageRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetUsageRequest | PlainMessage<GetUsageRequest> | undefined,
    b: GetUsageRequest | PlainMessage<GetUsageRequest> | undefined
  ): boolean {
    return proto3.util.equals(GetUsageRequest, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.GetUsageResponse
 */
export class GetUsageResponse extends Message<GetUsageResponse> {
  /**
   * @generated from field: repeated stanza.hub.v1.UsageTimeseries result = 1;
   */
  result: UsageTimeseries[] = [];

  constructor(data?: PartialMessage<GetUsageResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetUsageResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'result',
      kind: 'message',
      T: UsageTimeseries,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GetUsageResponse {
    return new GetUsageResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GetUsageResponse {
    return new GetUsageResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GetUsageResponse {
    return new GetUsageResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetUsageResponse | PlainMessage<GetUsageResponse> | undefined,
    b: GetUsageResponse | PlainMessage<GetUsageResponse> | undefined
  ): boolean {
    return proto3.util.equals(GetUsageResponse, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.UsageTimeseries
 */
export class UsageTimeseries extends Message<UsageTimeseries> {
  /**
   * @generated from field: repeated stanza.hub.v1.UsageTSDataPoint data = 1;
   */
  data: UsageTSDataPoint[] = [];

  /**
   * Axes for this timeseries - may not be applicable if there are no axes being queried in report mode
   *
   * @generated from field: optional string feature = 3;
   */
  feature?: string;

  /**
   * @generated from field: optional int32 priority = 4;
   */
  priority?: number;

  /**
   * @generated from field: repeated stanza.hub.v1.Tag tags = 5;
   */
  tags: Tag[] = [];

  /**
   * @generated from field: optional string guard = 6;
   */
  guard?: string;

  /**
   * @generated from field: optional string service = 7;
   */
  service?: string;

  constructor(data?: PartialMessage<UsageTimeseries>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.UsageTimeseries';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'data',
      kind: 'message',
      T: UsageTSDataPoint,
      repeated: true,
    },
    {
      no: 3,
      name: 'feature',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 4,
      name: 'priority',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    { no: 5, name: 'tags', kind: 'message', T: Tag, repeated: true },
    {
      no: 6,
      name: 'guard',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 7,
      name: 'service',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): UsageTimeseries {
    return new UsageTimeseries().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): UsageTimeseries {
    return new UsageTimeseries().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): UsageTimeseries {
    return new UsageTimeseries().fromJsonString(jsonString, options);
  }

  static equals(
    a: UsageTimeseries | PlainMessage<UsageTimeseries> | undefined,
    b: UsageTimeseries | PlainMessage<UsageTimeseries> | undefined
  ): boolean {
    return proto3.util.equals(UsageTimeseries, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.UsageTSDataPoint
 */
export class UsageTSDataPoint extends Message<UsageTSDataPoint> {
  /**
   * @generated from field: google.protobuf.Timestamp start_ts = 1;
   */
  startTs?: Timestamp;

  /**
   * @generated from field: google.protobuf.Timestamp end_ts = 2;
   */
  endTs?: Timestamp;

  /**
   * @generated from field: int32 granted = 3;
   */
  granted = 0;

  /**
   * @generated from field: float granted_weight = 4;
   */
  grantedWeight = 0;

  /**
   * @generated from field: int32 not_granted = 5;
   */
  notGranted = 0;

  /**
   * @generated from field: float not_granted_weight = 6;
   */
  notGrantedWeight = 0;

  /**
   * @generated from field: optional int32 be_burst = 7;
   */
  beBurst?: number;

  /**
   * @generated from field: optional float be_burst_weight = 8;
   */
  beBurstWeight?: number;

  /**
   * @generated from field: optional int32 parent_reject = 9;
   */
  parentReject?: number;

  /**
   * @generated from field: optional float parent_reject_weight = 10;
   */
  parentRejectWeight?: number;

  constructor(data?: PartialMessage<UsageTSDataPoint>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.UsageTSDataPoint';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'start_ts', kind: 'message', T: Timestamp },
    { no: 2, name: 'end_ts', kind: 'message', T: Timestamp },
    { no: 3, name: 'granted', kind: 'scalar', T: 5 /* ScalarType.INT32 */ },
    {
      no: 4,
      name: 'granted_weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
    },
    { no: 5, name: 'not_granted', kind: 'scalar', T: 5 /* ScalarType.INT32 */ },
    {
      no: 6,
      name: 'not_granted_weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
    },
    {
      no: 7,
      name: 'be_burst',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    {
      no: 8,
      name: 'be_burst_weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
      opt: true,
    },
    {
      no: 9,
      name: 'parent_reject',
      kind: 'scalar',
      T: 5 /* ScalarType.INT32 */,
      opt: true,
    },
    {
      no: 10,
      name: 'parent_reject_weight',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): UsageTSDataPoint {
    return new UsageTSDataPoint().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): UsageTSDataPoint {
    return new UsageTSDataPoint().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): UsageTSDataPoint {
    return new UsageTSDataPoint().fromJsonString(jsonString, options);
  }

  static equals(
    a: UsageTSDataPoint | PlainMessage<UsageTSDataPoint> | undefined,
    b: UsageTSDataPoint | PlainMessage<UsageTSDataPoint> | undefined
  ): boolean {
    return proto3.util.equals(UsageTSDataPoint, a, b);
  }
}
