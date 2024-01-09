import {
  BasicTracerProvider,
  type SDKRegistrationConfig,
  type TracerConfig,
} from '@opentelemetry/sdk-trace-base';
import { AsyncLocalStorageContextManager } from '../opentelemetry-context-async-hooks/AsyncLocalStorageContextManager';

export type CloudflareTracerConfig = TracerConfig;

export class CloudflareTracerProvider extends BasicTracerProvider {
  constructor(config: CloudflareTracerConfig = {}) {
    super(config);

    if ((config as SDKRegistrationConfig).contextManager != null) {
      throw new Error(
        'contextManager should be defined in register method not in constructor'
      );
    }
    if ((config as SDKRegistrationConfig).propagator != null) {
      throw new Error(
        'propagator should be defined in register method not in constructor'
      );
    }
  }

  override register(config: SDKRegistrationConfig = {}): void {
    if (config.contextManager === undefined) {
      config.contextManager = new AsyncLocalStorageContextManager();
      config.contextManager.enable();
    }

    super.register(config);
  }
}
