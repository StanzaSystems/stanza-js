import { type GuardConfig } from '../hub/model';
import { startPolling } from '../utils/startPolling';
import { fetchGuardConfig } from './fetchGuardConfig';
import { logger } from '../global/logger';
import { type Scheduler } from '../utils/scheduler';

export const startPollingGuardConfig = (
  guard: string,
  scheduler: Scheduler
) => {
  logger.info("start polling guard config for '%s' guard", guard);
  startPolling(
    async (prevResult: GuardConfig | null) =>
      fetchGuardConfig({
        guard,
        lastVersionSeen: prevResult?.version,
      }),
    { pollInterval: 15000 },
    scheduler
  );
};
