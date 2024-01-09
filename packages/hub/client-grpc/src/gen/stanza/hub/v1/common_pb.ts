// @generated by protoc-gen-es v1.6.0 with parameter "target=ts"
// @generated from file stanza/hub/v1/common.proto (package stanza.hub.v1, syntax proto3)
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
 * @generated from enum stanza.hub.v1.Health
 */
export enum Health {
  /**
   * @generated from enum value: HEALTH_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: HEALTH_OK = 1;
   */
  OK = 1,

  /**
   * @generated from enum value: HEALTH_OVERLOAD = 2;
   */
  OVERLOAD = 2,

  /**
   * @generated from enum value: HEALTH_DOWN = 3;
   */
  DOWN = 3,
}
// Retrieve enum metadata with: proto3.getEnumType(Health)
proto3.util.setEnumType(Health, 'stanza.hub.v1.Health', [
  { no: 0, name: 'HEALTH_UNSPECIFIED' },
  { no: 1, name: 'HEALTH_OK' },
  { no: 2, name: 'HEALTH_OVERLOAD' },
  { no: 3, name: 'HEALTH_DOWN' },
]);

/**
 * @generated from enum stanza.hub.v1.State
 */
export enum State {
  /**
   * @generated from enum value: STATE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: STATE_ENABLED = 1;
   */
  ENABLED = 1,

  /**
   * @generated from enum value: STATE_DISABLED = 2;
   */
  DISABLED = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(State)
proto3.util.setEnumType(State, 'stanza.hub.v1.State', [
  { no: 0, name: 'STATE_UNSPECIFIED' },
  { no: 1, name: 'STATE_ENABLED' },
  { no: 2, name: 'STATE_DISABLED' },
]);

/**
 * Config describes config state reasons used by Stanza SDKs
 *
 * @generated from enum stanza.hub.v1.Config
 */
export enum Config {
  /**
   * @generated from enum value: CONFIG_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * SDK has successfully fetched guard config previously and cached it
   *
   * @generated from enum value: CONFIG_CACHED_OK = 1;
   */
  CACHED_OK = 1,

  /**
   * SDK has successfully fetched guard config in response to this request
   *
   * @generated from enum value: CONFIG_FETCHED_OK = 2;
   */
  FETCHED_OK = 2,

  /**
   * SDK tried to fetch a Guard whose config could not be found
   *
   * @generated from enum value: CONFIG_NOT_FOUND = 3;
   */
  NOT_FOUND = 3,

  /**
   * SDK received an error from the Stanza control plane
   *
   * @generated from enum value: CONFIG_FETCH_ERROR = 4;
   */
  FETCH_ERROR = 4,

  /**
   * SDK timed out trying to get config from the Stanza control plane
   *
   * @generated from enum value: CONFIG_FETCH_TIMEOUT = 5;
   */
  FETCH_TIMEOUT = 5,
}
// Retrieve enum metadata with: proto3.getEnumType(Config)
proto3.util.setEnumType(Config, 'stanza.hub.v1.Config', [
  { no: 0, name: 'CONFIG_UNSPECIFIED' },
  { no: 1, name: 'CONFIG_CACHED_OK' },
  { no: 2, name: 'CONFIG_FETCHED_OK' },
  { no: 3, name: 'CONFIG_NOT_FOUND' },
  { no: 4, name: 'CONFIG_FETCH_ERROR' },
  { no: 5, name: 'CONFIG_FETCH_TIMEOUT' },
]);

/**
 * Local describes Guard reasons used by Stanza SDKs
 *
 * @generated from enum stanza.hub.v1.Local
 */
export enum Local {
  /**
   * @generated from enum value: LOCAL_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * SDK does not support locally evaluated rules
   *
   * @generated from enum value: LOCAL_NOT_SUPPORTED = 1;
   */
  NOT_SUPPORTED = 1,

  /**
   * SDK never evaluated (failed before local validation attempted)
   *
   * @generated from enum value: LOCAL_NOT_EVAL = 2;
   */
  NOT_EVAL = 2,

  /**
   * No locally evaluated rules exist for this guard or it was explicitly disabled
   *
   * @generated from enum value: LOCAL_EVAL_DISABLED = 3;
   */
  EVAL_DISABLED = 3,

  /**
   * Abstract “allowed” by all locally evaluated rules
   *
   * @generated from enum value: LOCAL_ALLOWED = 4;
   */
  ALLOWED = 4,

  /**
   * Abstract “blocked” by any locally evaluated rule
   *
   * @generated from enum value: LOCAL_BLOCKED = 5;
   */
  BLOCKED = 5,

  /**
   * SDK experienced some locally-sourced error and could not perform local rule evaluation
   *
   * @generated from enum value: LOCAL_ERROR = 6;
   */
  ERROR = 6,
}
// Retrieve enum metadata with: proto3.getEnumType(Local)
proto3.util.setEnumType(Local, 'stanza.hub.v1.Local', [
  { no: 0, name: 'LOCAL_UNSPECIFIED' },
  { no: 1, name: 'LOCAL_NOT_SUPPORTED' },
  { no: 2, name: 'LOCAL_NOT_EVAL' },
  { no: 3, name: 'LOCAL_EVAL_DISABLED' },
  { no: 4, name: 'LOCAL_ALLOWED' },
  { no: 5, name: 'LOCAL_BLOCKED' },
  { no: 6, name: 'LOCAL_ERROR' },
]);

/**
 * Token describes Guard reasons used by Stanza SDKs
 *
 * @generated from enum stanza.hub.v1.Token
 */
export enum Token {
  /**
   * @generated from enum value: TOKEN_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * SDK never evaluated (failed before token validation attempted)
   *
   * @generated from enum value: TOKEN_NOT_EVAL = 1;
   */
  NOT_EVAL = 1,

  /**
   * Guard configuration does not include evaluating tokens
   *
   * @generated from enum value: TOKEN_EVAL_DISABLED = 2;
   */
  EVAL_DISABLED = 2,

  /**
   * Stanza control plane checked the token and responded that it was not valid
   *
   * @generated from enum value: TOKEN_NOT_VALID = 3;
   */
  NOT_VALID = 3,

  /**
   * Stanza control plane checked the token and responded that it was valid
   *
   * @generated from enum value: TOKEN_VALID = 4;
   */
  VALID = 4,

  /**
   * Stanza control plane responded with an error when validating token
   *
   * @generated from enum value: TOKEN_VALIDATION_ERROR = 5;
   */
  VALIDATION_ERROR = 5,

  /**
   * Stanza control plane request to validate token timed out
   *
   * @generated from enum value: TOKEN_VALIDATION_TIMEOUT = 6;
   */
  VALIDATION_TIMEOUT = 6,
}
// Retrieve enum metadata with: proto3.getEnumType(Token)
proto3.util.setEnumType(Token, 'stanza.hub.v1.Token', [
  { no: 0, name: 'TOKEN_UNSPECIFIED' },
  { no: 1, name: 'TOKEN_NOT_EVAL' },
  { no: 2, name: 'TOKEN_EVAL_DISABLED' },
  { no: 3, name: 'TOKEN_NOT_VALID' },
  { no: 4, name: 'TOKEN_VALID' },
  { no: 5, name: 'TOKEN_VALIDATION_ERROR' },
  { no: 6, name: 'TOKEN_VALIDATION_TIMEOUT' },
]);

/**
 * Quota describes Guard reasons used by Stanza SDKs
 *
 * @generated from enum stanza.hub.v1.Quota
 */
export enum Quota {
  /**
   * @generated from enum value: QUOTA_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * SDK never evaluated (failed before quota validation attempted)
   *
   * @generated from enum value: QUOTA_NOT_EVAL = 1;
   */
  NOT_EVAL = 1,

  /**
   * Guard configuration does not include evaluating quota
   *
   * @generated from enum value: QUOTA_EVAL_DISABLED = 2;
   */
  EVAL_DISABLED = 2,

  /**
   * SDK experienced some locally-sourced error and could not check quota
   *
   * @generated from enum value: QUOTA_LOCAL_ERROR = 3;
   */
  LOCAL_ERROR = 3,

  /**
   * Stanza control plane checked quota and blocked the request
   *
   * @generated from enum value: QUOTA_BLOCKED = 4;
   */
  BLOCKED = 4,

  /**
   * Stanza control plane checked quota and granted the request
   *
   * @generated from enum value: QUOTA_GRANTED = 5;
   */
  GRANTED = 5,

  /**
   * Stanza control plane responded with an error when checking quota
   *
   * @generated from enum value: QUOTA_ERROR = 6;
   */
  ERROR = 6,

  /**
   * Stanza control plane request to check quota timed out
   *
   * @generated from enum value: QUOTA_TIMEOUT = 7;
   */
  TIMEOUT = 7,
}
// Retrieve enum metadata with: proto3.getEnumType(Quota)
proto3.util.setEnumType(Quota, 'stanza.hub.v1.Quota', [
  { no: 0, name: 'QUOTA_UNSPECIFIED' },
  { no: 1, name: 'QUOTA_NOT_EVAL' },
  { no: 2, name: 'QUOTA_EVAL_DISABLED' },
  { no: 3, name: 'QUOTA_LOCAL_ERROR' },
  { no: 4, name: 'QUOTA_BLOCKED' },
  { no: 5, name: 'QUOTA_GRANTED' },
  { no: 6, name: 'QUOTA_ERROR' },
  { no: 7, name: 'QUOTA_TIMEOUT' },
]);

/**
 * Mode describes what mode the Guard or Service is operating under.
 *
 * @generated from enum stanza.hub.v1.Mode
 */
export enum Mode {
  /**
   * @generated from enum value: MODE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * Normal, Stanza may shed requests according to its configuration
   *
   * @generated from enum value: MODE_NORMAL = 1;
   */
  NORMAL = 1,

  /**
   * Report-only, Stanza never sheds requests, but does perform all processing and records metrics about the actions that would be taken if in normal mode
   *
   * @generated from enum value: MODE_REPORT_ONLY = 2;
   */
  REPORT_ONLY = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(Mode)
proto3.util.setEnumType(Mode, 'stanza.hub.v1.Mode', [
  { no: 0, name: 'MODE_UNSPECIFIED' },
  { no: 1, name: 'MODE_NORMAL' },
  { no: 2, name: 'MODE_REPORT_ONLY' },
]);

/**
 * @generated from message stanza.hub.v1.GuardSelector
 */
export class GuardSelector extends Message<GuardSelector> {
  /**
   * @generated from field: string environment = 1;
   */
  environment = '';

  /**
   * @generated from field: string name = 2;
   */
  name = '';

  /**
   * @generated from field: repeated stanza.hub.v1.Tag tags = 6;
   */
  tags: Tag[] = [];

  constructor(data?: PartialMessage<GuardSelector>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GuardSelector';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 2, name: 'name', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 6, name: 'tags', kind: 'message', T: Tag, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GuardSelector {
    return new GuardSelector().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GuardSelector {
    return new GuardSelector().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GuardSelector {
    return new GuardSelector().fromJsonString(jsonString, options);
  }

  static equals(
    a: GuardSelector | PlainMessage<GuardSelector> | undefined,
    b: GuardSelector | PlainMessage<GuardSelector> | undefined
  ): boolean {
    return proto3.util.equals(GuardSelector, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.FeatureSelector
 */
export class FeatureSelector extends Message<FeatureSelector> {
  /**
   * @generated from field: string environment = 1;
   */
  environment = '';

  /**
   * @generated from field: repeated string names = 2;
   */
  names: string[] = [];

  /**
   * @generated from field: repeated stanza.hub.v1.Tag tags = 6;
   */
  tags: Tag[] = [];

  constructor(data?: PartialMessage<FeatureSelector>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.FeatureSelector';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    {
      no: 2,
      name: 'names',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
    { no: 6, name: 'tags', kind: 'message', T: Tag, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): FeatureSelector {
    return new FeatureSelector().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): FeatureSelector {
    return new FeatureSelector().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): FeatureSelector {
    return new FeatureSelector().fromJsonString(jsonString, options);
  }

  static equals(
    a: FeatureSelector | PlainMessage<FeatureSelector> | undefined,
    b: FeatureSelector | PlainMessage<FeatureSelector> | undefined
  ): boolean {
    return proto3.util.equals(FeatureSelector, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.GuardFeatureSelector
 */
export class GuardFeatureSelector extends Message<GuardFeatureSelector> {
  /**
   * @generated from field: string environment = 1;
   */
  environment = '';

  /**
   * @generated from field: string guard_name = 2;
   */
  guardName = '';

  /**
   * @generated from field: optional string feature_name = 3;
   */
  featureName?: string;

  /**
   * @generated from field: repeated stanza.hub.v1.Tag tags = 6;
   */
  tags: Tag[] = [];

  constructor(data?: PartialMessage<GuardFeatureSelector>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GuardFeatureSelector';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 2, name: 'guard_name', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 3,
      name: 'feature_name',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 6, name: 'tags', kind: 'message', T: Tag, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GuardFeatureSelector {
    return new GuardFeatureSelector().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GuardFeatureSelector {
    return new GuardFeatureSelector().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GuardFeatureSelector {
    return new GuardFeatureSelector().fromJsonString(jsonString, options);
  }

  static equals(
    a: GuardFeatureSelector | PlainMessage<GuardFeatureSelector> | undefined,
    b: GuardFeatureSelector | PlainMessage<GuardFeatureSelector> | undefined
  ): boolean {
    return proto3.util.equals(GuardFeatureSelector, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.GuardServiceSelector
 */
export class GuardServiceSelector extends Message<GuardServiceSelector> {
  /**
   * @generated from field: string environment = 1;
   */
  environment = '';

  /**
   * @generated from field: string guard_name = 2;
   */
  guardName = '';

  /**
   * @generated from field: string service_name = 3;
   */
  serviceName = '';

  /**
   * @generated from field: string service_release = 4;
   */
  serviceRelease = '';

  /**
   * @generated from field: repeated stanza.hub.v1.Tag tags = 6;
   */
  tags: Tag[] = [];

  constructor(data?: PartialMessage<GuardServiceSelector>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GuardServiceSelector';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 2, name: 'guard_name', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 3,
      name: 'service_name',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    {
      no: 4,
      name: 'service_release',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 6, name: 'tags', kind: 'message', T: Tag, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): GuardServiceSelector {
    return new GuardServiceSelector().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): GuardServiceSelector {
    return new GuardServiceSelector().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): GuardServiceSelector {
    return new GuardServiceSelector().fromJsonString(jsonString, options);
  }

  static equals(
    a: GuardServiceSelector | PlainMessage<GuardServiceSelector> | undefined,
    b: GuardServiceSelector | PlainMessage<GuardServiceSelector> | undefined
  ): boolean {
    return proto3.util.equals(GuardServiceSelector, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.ServiceSelector
 */
export class ServiceSelector extends Message<ServiceSelector> {
  /**
   * @generated from field: string environment = 1;
   */
  environment = '';

  /**
   * @generated from field: string name = 2;
   */
  name = '';

  /**
   * @generated from field: optional string release = 3;
   */
  release?: string;

  /**
   * @generated from field: repeated stanza.hub.v1.Tag tags = 6;
   */
  tags: Tag[] = [];

  constructor(data?: PartialMessage<ServiceSelector>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.ServiceSelector';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'environment',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 2, name: 'name', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 3,
      name: 'release',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 6, name: 'tags', kind: 'message', T: Tag, repeated: true },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): ServiceSelector {
    return new ServiceSelector().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): ServiceSelector {
    return new ServiceSelector().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): ServiceSelector {
    return new ServiceSelector().fromJsonString(jsonString, options);
  }

  static equals(
    a: ServiceSelector | PlainMessage<ServiceSelector> | undefined,
    b: ServiceSelector | PlainMessage<ServiceSelector> | undefined
  ): boolean {
    return proto3.util.equals(ServiceSelector, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.HealthByPriority
 */
export class HealthByPriority extends Message<HealthByPriority> {
  /**
   * @generated from field: uint32 priority = 1;
   */
  priority = 0;

  /**
   * @generated from field: stanza.hub.v1.Health health = 2;
   */
  health = Health.UNSPECIFIED;

  constructor(data?: PartialMessage<HealthByPriority>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.HealthByPriority';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'priority', kind: 'scalar', T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: 'health', kind: 'enum', T: proto3.getEnumType(Health) },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): HealthByPriority {
    return new HealthByPriority().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): HealthByPriority {
    return new HealthByPriority().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): HealthByPriority {
    return new HealthByPriority().fromJsonString(jsonString, options);
  }

  static equals(
    a: HealthByPriority | PlainMessage<HealthByPriority> | undefined,
    b: HealthByPriority | PlainMessage<HealthByPriority> | undefined
  ): boolean {
    return proto3.util.equals(HealthByPriority, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.Tag
 */
export class Tag extends Message<Tag> {
  /**
   * @generated from field: string key = 1;
   */
  key = '';

  /**
   * @generated from field: string value = 2;
   */
  value = '';

  constructor(data?: PartialMessage<Tag>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.Tag';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'key', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 2, name: 'value', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>
  ): Tag {
    return new Tag().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>
  ): Tag {
    return new Tag().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>
  ): Tag {
    return new Tag().fromJsonString(jsonString, options);
  }

  static equals(
    a: Tag | PlainMessage<Tag> | undefined,
    b: Tag | PlainMessage<Tag> | undefined
  ): boolean {
    return proto3.util.equals(Tag, a, b);
  }
}