// @generated by protoc-gen-es v1.4.1 with parameter "target=ts"
// @generated from file stanza/hub/v1/config.proto (package stanza.hub.v1, syntax proto3)
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
import {
  FeatureSelector,
  GuardServiceSelector,
  ServiceSelector,
} from './common_pb.js';

/**
 * Request from Backend SDKs for a Guard Config. SDKs are expected to periodically poll, giving the version of the most recent configuration seen. Configurations may be large; we will not re-send them unless they have changed. Guard configurations may vary between environments but are SHARED between Services.
 *
 * @generated from message stanza.hub.v1.GetGuardConfigRequest
 */
export class GetGuardConfigRequest extends Message<GetGuardConfigRequest> {
  /**
   * Set if the client has seen a previous version of the config. Server will send data only if newer config available.
   *
   * @generated from field: optional string version_seen = 1;
   */
  versionSeen?: string;

  /**
   * Information required to select and return the correct GuardConfig version.
   *
   * @generated from field: stanza.hub.v1.GuardServiceSelector selector = 2;
   */
  selector?: GuardServiceSelector;

  constructor(data?: PartialMessage<GetGuardConfigRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetGuardConfigRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'version_seen',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 2, name: 'selector', kind: 'message', T: GuardServiceSelector },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetGuardConfigRequest {
    return new GetGuardConfigRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetGuardConfigRequest {
    return new GetGuardConfigRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetGuardConfigRequest {
    return new GetGuardConfigRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a: GetGuardConfigRequest | PlainMessage<GetGuardConfigRequest> | undefined,
    b: GetGuardConfigRequest | PlainMessage<GetGuardConfigRequest> | undefined,
  ): boolean {
    return proto3.util.equals(GetGuardConfigRequest, a, b);
  }
}

/**
 * The response from Hub to Backend SDKs. Note that `config_data_sent` will be false and `config` will be empty if we did not have a newer config version than `version_seen`.
 *
 * @generated from message stanza.hub.v1.GetGuardConfigResponse
 */
export class GetGuardConfigResponse extends Message<GetGuardConfigResponse> {
  /**
   * @generated from field: string version = 1;
   */
  version = '';

  /**
   * @generated from field: bool config_data_sent = 2;
   */
  configDataSent = false;

  /**
   * @generated from field: stanza.hub.v1.GuardConfig config = 3;
   */
  config?: GuardConfig;

  constructor(data?: PartialMessage<GetGuardConfigResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetGuardConfigResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'version', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 2,
      name: 'config_data_sent',
      kind: 'scalar',
      T: 8 /* ScalarType.BOOL */,
    },
    { no: 3, name: 'config', kind: 'message', T: GuardConfig },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetGuardConfigResponse {
    return new GetGuardConfigResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetGuardConfigResponse {
    return new GetGuardConfigResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetGuardConfigResponse {
    return new GetGuardConfigResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a:
      | GetGuardConfigResponse
      | PlainMessage<GetGuardConfigResponse>
      | undefined,
    b:
      | GetGuardConfigResponse
      | PlainMessage<GetGuardConfigResponse>
      | undefined,
  ): boolean {
    return proto3.util.equals(GetGuardConfigResponse, a, b);
  }
}

/**
 * GuardConfig represents a configuration for a given Stanza SDK instrumented Guard, which may be used by multiple services!
 * If check_quota is false, then no ratelimiting will be performed. All quota requests will succeed and the SDK may short-circuit quota requests, i.e. not call Hub for quota.
 * At a later point, there will be additional per-Guard configuration, such as deadline overrides, adaptive circuitbreaking configs, etc.
 *
 * @generated from message stanza.hub.v1.GuardConfig
 */
export class GuardConfig extends Message<GuardConfig> {
  /**
   * Boolean representing wether to validate contents of the X-Stanza-Token header.
   *
   * @generated from field: bool validate_ingress_tokens = 1;
   */
  validateIngressTokens = false;

  /**
   * Quota
   *
   * Boolean representing whether quota checks are enabled.
   *
   * @generated from field: bool check_quota = 5;
   */
  checkQuota = false;

  /**
   * The set of tags which are used for quota management. For example, a 'customer_id' tag might be used to implement per-customer quota limits. Only the tags listed here should be included in GetToken and GetTokenLease requests.
   *
   * @generated from field: repeated string quota_tags = 6;
   */
  quotaTags: string[] = [];

  /**
   * If report_only is true then the SDK should perform all load management logic and emit statistics, but never actually throttle or deny requests for any reason.
   * However, the SDK should emit accurate metrics about what actions would normally be taken if Report Only mode were not enabled. The purpose of this is to allow
   * users to assess the impact of enabling a Guard without risking over-throttling traffic.
   * The label mode="report_only" should be set on all metrics sent to Stanza.
   *
   * @generated from field: bool report_only = 7;
   */
  reportOnly = false;

  constructor(data?: PartialMessage<GuardConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GuardConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'validate_ingress_tokens',
      kind: 'scalar',
      T: 8 /* ScalarType.BOOL */,
    },
    { no: 5, name: 'check_quota', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
    {
      no: 6,
      name: 'quota_tags',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
    { no: 7, name: 'report_only', kind: 'scalar', T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GuardConfig {
    return new GuardConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GuardConfig {
    return new GuardConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GuardConfig {
    return new GuardConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: GuardConfig | PlainMessage<GuardConfig> | undefined,
    b: GuardConfig | PlainMessage<GuardConfig> | undefined,
  ): boolean {
    return proto3.util.equals(GuardConfig, a, b);
  }
}

/**
 * The request from Browser SDKs for a Browser Context. SDKs are expected to periodically poll, giving the version of the most recent configuration seen. Configurations may be large; we will not re-send them unless they have changed.
 *
 * @generated from message stanza.hub.v1.GetBrowserContextRequest
 */
export class GetBrowserContextRequest extends Message<GetBrowserContextRequest> {
  /**
   * Information required to select and return the most recent BrowserContext version. If Feature names is nil, will return all Features in the organization associated with the bearer token/API key, otherwise only information related to the named Features will be returned.
   *
   * @generated from field: stanza.hub.v1.FeatureSelector feature = 1;
   */
  feature?: FeatureSelector;

  constructor(data?: PartialMessage<GetBrowserContextRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetBrowserContextRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'feature', kind: 'message', T: FeatureSelector },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetBrowserContextRequest {
    return new GetBrowserContextRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetBrowserContextRequest {
    return new GetBrowserContextRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetBrowserContextRequest {
    return new GetBrowserContextRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a:
      | GetBrowserContextRequest
      | PlainMessage<GetBrowserContextRequest>
      | undefined,
    b:
      | GetBrowserContextRequest
      | PlainMessage<GetBrowserContextRequest>
      | undefined,
  ): boolean {
    return proto3.util.equals(GetBrowserContextRequest, a, b);
  }
}

/**
 * The response to Browser SDKs is designed to be cacheable for short periods. It is also designed to be shareable between multiple clients (e.g. in case of SSR or use of CDN etc). May return 304 Not Modified with ETag header and empty payload.
 *
 * @generated from message stanza.hub.v1.GetBrowserContextResponse
 */
export class GetBrowserContextResponse extends Message<GetBrowserContextResponse> {
  /**
   * @generated from field: repeated stanza.hub.v1.FeatureConfig feature_configs = 2;
   */
  featureConfigs: FeatureConfig[] = [];

  constructor(data?: PartialMessage<GetBrowserContextResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetBrowserContextResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 2,
      name: 'feature_configs',
      kind: 'message',
      T: FeatureConfig,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetBrowserContextResponse {
    return new GetBrowserContextResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetBrowserContextResponse {
    return new GetBrowserContextResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetBrowserContextResponse {
    return new GetBrowserContextResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a:
      | GetBrowserContextResponse
      | PlainMessage<GetBrowserContextResponse>
      | undefined,
    b:
      | GetBrowserContextResponse
      | PlainMessage<GetBrowserContextResponse>
      | undefined,
  ): boolean {
    return proto3.util.equals(GetBrowserContextResponse, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.FeatureConfig
 */
export class FeatureConfig extends Message<FeatureConfig> {
  /**
   * @generated from field: string name = 1;
   */
  name = '';

  /**
   * @generated from field: stanza.hub.v1.BrowserConfig config = 2;
   */
  config?: BrowserConfig;

  constructor(data?: PartialMessage<FeatureConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.FeatureConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'name', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 2, name: 'config', kind: 'message', T: BrowserConfig },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): FeatureConfig {
    return new FeatureConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): FeatureConfig {
    return new FeatureConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): FeatureConfig {
    return new FeatureConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: FeatureConfig | PlainMessage<FeatureConfig> | undefined,
    b: FeatureConfig | PlainMessage<FeatureConfig> | undefined,
  ): boolean {
    return proto3.util.equals(FeatureConfig, a, b);
  }
}

/**
 * BrowserConfig describes the current configuration for one Feature.
 * Instead of being simply enabled or disabled, features are enabled for a
 * particular percentage of clients (0% is entirely disabled, 100% is entirely enabled).
 * Clients are required to self-select a percentile value from 1 to 100 in a way that is random
 * and trusted to consider a Feature disabled if it is disabled for the selected percentile.
 * action_code_disabled describes what the Browser is expected to do if the Feature is not enabled for
 * their assigned percentile.
 * message_disabled may be displayed as a fallback action.
 * action_code_enabled describes what the Browser is expected to do if the Feature is enabled for
 * their assigned percentile. This enabled degraded modes. Can be empty.
 * message_enabled may be displayed while in degraded mode. Can be empty.
 * Likely additional fields will be added here as the Browser SDK behavior set becomes more complex.
 *
 * @generated from message stanza.hub.v1.BrowserConfig
 */
export class BrowserConfig extends Message<BrowserConfig> {
  /**
   * @generated from field: optional uint32 enabled_percent = 2;
   */
  enabledPercent?: number;

  /**
   * @generated from field: optional uint32 action_code_enabled = 3;
   */
  actionCodeEnabled?: number;

  /**
   * @generated from field: optional string message_enabled = 4;
   */
  messageEnabled?: string;

  /**
   * @generated from field: optional uint32 action_code_disabled = 5;
   */
  actionCodeDisabled?: number;

  /**
   * @generated from field: optional string message_disabled = 6;
   */
  messageDisabled?: string;

  constructor(data?: PartialMessage<BrowserConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.BrowserConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 2,
      name: 'enabled_percent',
      kind: 'scalar',
      T: 13 /* ScalarType.UINT32 */,
      opt: true,
    },
    {
      no: 3,
      name: 'action_code_enabled',
      kind: 'scalar',
      T: 13 /* ScalarType.UINT32 */,
      opt: true,
    },
    {
      no: 4,
      name: 'message_enabled',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 5,
      name: 'action_code_disabled',
      kind: 'scalar',
      T: 13 /* ScalarType.UINT32 */,
      opt: true,
    },
    {
      no: 6,
      name: 'message_disabled',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): BrowserConfig {
    return new BrowserConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): BrowserConfig {
    return new BrowserConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): BrowserConfig {
    return new BrowserConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: BrowserConfig | PlainMessage<BrowserConfig> | undefined,
    b: BrowserConfig | PlainMessage<BrowserConfig> | undefined,
  ): boolean {
    return proto3.util.equals(BrowserConfig, a, b);
  }
}

/**
 * The request from Backend SDKs for a Service Config. SDKs are expected to periodically poll, giving the version of the most recent configuration seen. Configurations may be large; we will not re-send them unless they have changed.
 *
 * @generated from message stanza.hub.v1.GetServiceConfigRequest
 */
export class GetServiceConfigRequest extends Message<GetServiceConfigRequest> {
  /**
   * Set if the client has seen a previous version of the config. Server will send data only if newer config available.
   *
   * @generated from field: string version_seen = 1;
   */
  versionSeen = '';

  /**
   * Information required to select and return the most recent ServiceConfig version
   *
   * @generated from field: stanza.hub.v1.ServiceSelector service = 2;
   */
  service?: ServiceSelector;

  /**
   * This is the same stable client_id that is used when requesting quota via GetTokenRequest/GetTokenLeaseRequest endpoints.
   * If supplied, it permits Stanza to provide per-service telemetry and report on service<>guard and service<>feature relationships.
   *
   * @generated from field: optional string client_id = 3;
   */
  clientId?: string;

  constructor(data?: PartialMessage<GetServiceConfigRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetServiceConfigRequest';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'version_seen',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 2, name: 'service', kind: 'message', T: ServiceSelector },
    {
      no: 3,
      name: 'client_id',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetServiceConfigRequest {
    return new GetServiceConfigRequest().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetServiceConfigRequest {
    return new GetServiceConfigRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetServiceConfigRequest {
    return new GetServiceConfigRequest().fromJsonString(jsonString, options);
  }

  static equals(
    a:
      | GetServiceConfigRequest
      | PlainMessage<GetServiceConfigRequest>
      | undefined,
    b:
      | GetServiceConfigRequest
      | PlainMessage<GetServiceConfigRequest>
      | undefined,
  ): boolean {
    return proto3.util.equals(GetServiceConfigRequest, a, b);
  }
}

/**
 * The response to Backend SDKs. Note that `config_data_sent` will be false and `config` will be empty if we did not have a newer config version than `version_seen`.
 *
 * @generated from message stanza.hub.v1.GetServiceConfigResponse
 */
export class GetServiceConfigResponse extends Message<GetServiceConfigResponse> {
  /**
   * @generated from field: string version = 1;
   */
  version = '';

  /**
   * @generated from field: bool config_data_sent = 2;
   */
  configDataSent = false;

  /**
   * @generated from field: stanza.hub.v1.ServiceConfig config = 3;
   */
  config?: ServiceConfig;

  constructor(data?: PartialMessage<GetServiceConfigResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.GetServiceConfigResponse';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'version', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 2,
      name: 'config_data_sent',
      kind: 'scalar',
      T: 8 /* ScalarType.BOOL */,
    },
    { no: 3, name: 'config', kind: 'message', T: ServiceConfig },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): GetServiceConfigResponse {
    return new GetServiceConfigResponse().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): GetServiceConfigResponse {
    return new GetServiceConfigResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): GetServiceConfigResponse {
    return new GetServiceConfigResponse().fromJsonString(jsonString, options);
  }

  static equals(
    a:
      | GetServiceConfigResponse
      | PlainMessage<GetServiceConfigResponse>
      | undefined,
    b:
      | GetServiceConfigResponse
      | PlainMessage<GetServiceConfigResponse>
      | undefined,
  ): boolean {
    return proto3.util.equals(GetServiceConfigResponse, a, b);
  }
}

/**
 * ServiceConfig represents a configuration for a given Stanza SDK instrumented service.
 *
 * @generated from message stanza.hub.v1.ServiceConfig
 */
export class ServiceConfig extends Message<ServiceConfig> {
  /**
   * @generated from field: optional string customer_id = 1;
   */
  customerId?: string;

  /**
   * @generated from field: optional stanza.hub.v1.TraceConfig trace_config = 3;
   */
  traceConfig?: TraceConfig;

  /**
   * @generated from field: optional stanza.hub.v1.MetricConfig metric_config = 4;
   */
  metricConfig?: MetricConfig;

  /**
   * @generated from field: optional stanza.hub.v1.SentinelConfig sentinel_config = 5;
   */
  sentinelConfig?: SentinelConfig;

  constructor(data?: PartialMessage<ServiceConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.ServiceConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'customer_id',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 3, name: 'trace_config', kind: 'message', T: TraceConfig, opt: true },
    {
      no: 4,
      name: 'metric_config',
      kind: 'message',
      T: MetricConfig,
      opt: true,
    },
    {
      no: 5,
      name: 'sentinel_config',
      kind: 'message',
      T: SentinelConfig,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): ServiceConfig {
    return new ServiceConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): ServiceConfig {
    return new ServiceConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): ServiceConfig {
    return new ServiceConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: ServiceConfig | PlainMessage<ServiceConfig> | undefined,
    b: ServiceConfig | PlainMessage<ServiceConfig> | undefined,
  ): boolean {
    return proto3.util.equals(ServiceConfig, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.TraceConfig
 */
export class TraceConfig extends Message<TraceConfig> {
  /**
   * URL of OTEL trace collector. If URL begins with http or https it will be treated as an HTTP collector, otherwise it will be treated as a gRPC collector.
   *
   * @generated from field: optional string collector_url = 1;
   */
  collectorUrl?: string;

  /**
   * default base sampling rate
   *
   * @generated from field: optional float sample_rate_default = 3;
   */
  sampleRateDefault?: number;

  /**
   * span sampling rate overrides
   *
   * @generated from field: repeated stanza.hub.v1.TraceConfigOverride overrides = 4;
   */
  overrides: TraceConfigOverride[] = [];

  /**
   * which headers to capture
   *
   * @generated from field: repeated stanza.hub.v1.HeaderTraceConfig header_sample_configs = 5;
   */
  headerSampleConfigs: HeaderTraceConfig[] = [];

  /**
   * which parameters to capture
   *
   * @generated from field: repeated stanza.hub.v1.ParamTraceConfig param_sample_configs = 6;
   */
  paramSampleConfigs: ParamTraceConfig[] = [];

  constructor(data?: PartialMessage<TraceConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.TraceConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'collector_url',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 3,
      name: 'sample_rate_default',
      kind: 'scalar',
      T: 2 /* ScalarType.FLOAT */,
      opt: true,
    },
    {
      no: 4,
      name: 'overrides',
      kind: 'message',
      T: TraceConfigOverride,
      repeated: true,
    },
    {
      no: 5,
      name: 'header_sample_configs',
      kind: 'message',
      T: HeaderTraceConfig,
      repeated: true,
    },
    {
      no: 6,
      name: 'param_sample_configs',
      kind: 'message',
      T: ParamTraceConfig,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): TraceConfig {
    return new TraceConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): TraceConfig {
    return new TraceConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): TraceConfig {
    return new TraceConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: TraceConfig | PlainMessage<TraceConfig> | undefined,
    b: TraceConfig | PlainMessage<TraceConfig> | undefined,
  ): boolean {
    return proto3.util.equals(TraceConfig, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.MetricConfig
 */
export class MetricConfig extends Message<MetricConfig> {
  /**
   * URL of OTEL metric collector. If URL begins with http or https it will be treated as an HTTP collector, otherwise it will be treated as a gRPC collector.
   *
   * @generated from field: optional string collector_url = 1;
   */
  collectorUrl?: string;

  constructor(data?: PartialMessage<MetricConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.MetricConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'collector_url',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): MetricConfig {
    return new MetricConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): MetricConfig {
    return new MetricConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): MetricConfig {
    return new MetricConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: MetricConfig | PlainMessage<MetricConfig> | undefined,
    b: MetricConfig | PlainMessage<MetricConfig> | undefined,
  ): boolean {
    return proto3.util.equals(MetricConfig, a, b);
  }
}

/**
 * SentinelConfig represents Sentinel compliant JSON configuration for the given Sentinel types. These rules are "per service" (not per Guard) with Guard specific routing encoded in the given JSON blobs (as Sentinel "Resources").
 *
 * @generated from message stanza.hub.v1.SentinelConfig
 */
export class SentinelConfig extends Message<SentinelConfig> {
  /**
   * @generated from field: optional string circuitbreaker_rules_json = 1;
   */
  circuitbreakerRulesJson?: string;

  /**
   * @generated from field: optional string flow_rules_json = 2;
   */
  flowRulesJson?: string;

  /**
   * @generated from field: optional string isolation_rules_json = 3;
   */
  isolationRulesJson?: string;

  /**
   * @generated from field: optional string system_rules_json = 4;
   */
  systemRulesJson?: string;

  constructor(data?: PartialMessage<SentinelConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.SentinelConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'circuitbreaker_rules_json',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 2,
      name: 'flow_rules_json',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 3,
      name: 'isolation_rules_json',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 4,
      name: 'system_rules_json',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): SentinelConfig {
    return new SentinelConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): SentinelConfig {
    return new SentinelConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): SentinelConfig {
    return new SentinelConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: SentinelConfig | PlainMessage<SentinelConfig> | undefined,
    b: SentinelConfig | PlainMessage<SentinelConfig> | undefined,
  ): boolean {
    return proto3.util.equals(SentinelConfig, a, b);
  }
}

/**
 * This configuration allows different sample rates to be applied to selected spans.
 *
 * @generated from message stanza.hub.v1.TraceConfigOverride
 */
export class TraceConfigOverride extends Message<TraceConfigOverride> {
  /**
   * @generated from field: float sample_rate = 1;
   */
  sampleRate = 0;

  /**
   * @generated from field: repeated stanza.hub.v1.SpanSelector span_selectors = 2;
   */
  spanSelectors: SpanSelector[] = [];

  constructor(data?: PartialMessage<TraceConfigOverride>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.TraceConfigOverride';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'sample_rate', kind: 'scalar', T: 2 /* ScalarType.FLOAT */ },
    {
      no: 2,
      name: 'span_selectors',
      kind: 'message',
      T: SpanSelector,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): TraceConfigOverride {
    return new TraceConfigOverride().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): TraceConfigOverride {
    return new TraceConfigOverride().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): TraceConfigOverride {
    return new TraceConfigOverride().fromJsonString(jsonString, options);
  }

  static equals(
    a: TraceConfigOverride | PlainMessage<TraceConfigOverride> | undefined,
    b: TraceConfigOverride | PlainMessage<TraceConfigOverride> | undefined,
  ): boolean {
    return proto3.util.equals(TraceConfigOverride, a, b);
  }
}

/**
 * @generated from message stanza.hub.v1.SpanSelector
 */
export class SpanSelector extends Message<SpanSelector> {
  /**
   * OTel attribute, e.g. peer.service, status, http.status_code. See:
   * https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/span-general/
   * https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/http/
   *
   * @generated from field: string otel_attribute = 1;
   */
  otelAttribute = '';

  /**
   * Selector matches if value of 'otel_attribute' equals 'value'.
   *
   * @generated from field: string value = 2;
   */
  value = '';

  constructor(data?: PartialMessage<SpanSelector>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.SpanSelector';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'otel_attribute',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
    },
    { no: 2, name: 'value', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): SpanSelector {
    return new SpanSelector().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): SpanSelector {
    return new SpanSelector().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): SpanSelector {
    return new SpanSelector().fromJsonString(jsonString, options);
  }

  static equals(
    a: SpanSelector | PlainMessage<SpanSelector> | undefined,
    b: SpanSelector | PlainMessage<SpanSelector> | undefined,
  ): boolean {
    return proto3.util.equals(SpanSelector, a, b);
  }
}

/**
 * Specifies which headers should be sampled - required by OTel spec.
 *
 * @generated from message stanza.hub.v1.HeaderTraceConfig
 */
export class HeaderTraceConfig extends Message<HeaderTraceConfig> {
  /**
   * If no selectors specified then config is applied to all requests
   *
   * @generated from field: repeated stanza.hub.v1.SpanSelector span_selectors = 1;
   */
  spanSelectors: SpanSelector[] = [];

  /**
   * Names of headers to collect
   *
   * @generated from field: repeated string request_header_names = 2;
   */
  requestHeaderNames: string[] = [];

  /**
   * Names of headers to collect
   *
   * @generated from field: repeated string response_header_names = 3;
   */
  responseHeaderNames: string[] = [];

  constructor(data?: PartialMessage<HeaderTraceConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.HeaderTraceConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'span_selectors',
      kind: 'message',
      T: SpanSelector,
      repeated: true,
    },
    {
      no: 2,
      name: 'request_header_names',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
    {
      no: 3,
      name: 'response_header_names',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): HeaderTraceConfig {
    return new HeaderTraceConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): HeaderTraceConfig {
    return new HeaderTraceConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): HeaderTraceConfig {
    return new HeaderTraceConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: HeaderTraceConfig | PlainMessage<HeaderTraceConfig> | undefined,
    b: HeaderTraceConfig | PlainMessage<HeaderTraceConfig> | undefined,
  ): boolean {
    return proto3.util.equals(HeaderTraceConfig, a, b);
  }
}

/**
 * Specifies which request parameters should be sampled.
 *
 * @generated from message stanza.hub.v1.ParamTraceConfig
 */
export class ParamTraceConfig extends Message<ParamTraceConfig> {
  /**
   * If no selectors specified then config is applied to all requests
   *
   * @generated from field: repeated stanza.hub.v1.SpanSelector span_selectors = 1;
   */
  spanSelectors: SpanSelector[] = [];

  /**
   * Names of parameters to collect
   *
   * @generated from field: repeated string parameter_names = 2;
   */
  parameterNames: string[] = [];

  constructor(data?: PartialMessage<ParamTraceConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'stanza.hub.v1.ParamTraceConfig';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'span_selectors',
      kind: 'message',
      T: SpanSelector,
      repeated: true,
    },
    {
      no: 2,
      name: 'parameter_names',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      repeated: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): ParamTraceConfig {
    return new ParamTraceConfig().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): ParamTraceConfig {
    return new ParamTraceConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): ParamTraceConfig {
    return new ParamTraceConfig().fromJsonString(jsonString, options);
  }

  static equals(
    a: ParamTraceConfig | PlainMessage<ParamTraceConfig> | undefined,
    b: ParamTraceConfig | PlainMessage<ParamTraceConfig> | undefined,
  ): boolean {
    return proto3.util.equals(ParamTraceConfig, a, b);
  }
}
