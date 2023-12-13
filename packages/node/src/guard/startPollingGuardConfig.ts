import { type GuardConfig } from '@getstanza/hub-client-api';
import { startPolling } from '../utils/startPolling';
import { fetchGuardConfig } from './fetchGuardConfig';
import { logger } from '../global/logger';

export const startPollingGuardConfig = (guard: string) => {
  logger.info("start polling guard config for '%s' guard", guard);
  startPolling(
    async (prevResult: GuardConfig | null) =>
      fetchGuardConfig({
        guard,
        lastVersionSeen: prevResult?.version,
      }),
    { pollInterval: 15000 }
  );
};
