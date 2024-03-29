import { hubService } from '../global/hubService';
import {
  isServiceConfigInitialized,
  updateServiceConfig,
} from '../global/serviceConfig';
import {
  type FetchServiceConfigOptions,
  type ServiceConfig,
} from '@getstanza/hub-client-api';

export async function fetchServiceConfig(
  options?: FetchServiceConfigOptions
): Promise<ServiceConfig | null> {
  let serviceConfig: ServiceConfig | null = null;
  try {
    serviceConfig = await hubService.fetchServiceConfig(options);
  } finally {
    if (!isServiceConfigInitialized() || serviceConfig !== null) {
      updateServiceConfig(serviceConfig ?? undefined);
    }
  }
  return serviceConfig;
}
