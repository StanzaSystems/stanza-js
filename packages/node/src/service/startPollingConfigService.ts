import { fetchServiceConfig } from './fetchServiceConfig';
import { type ServiceConfig } from '../hub/model';
import { startPolling } from '../utils/startPolling';
import { logger } from '../global/logger';
import { type FetchServiceConfigOptions } from '../hub/hubService';

export const startPollingServiceConfig = (clientId: string) => {
  logger.debug('start polling service config');
  startPolling(
    async (prevResult: ServiceConfig | null) => {
      const options: FetchServiceConfigOptions = {
        clientId,
      };

      if (prevResult?.version !== undefined) {
        options.lastVersionSeen = prevResult.version;
      }

      return fetchServiceConfig(options);
    },
    { pollInterval: 15000 },
  );
};
