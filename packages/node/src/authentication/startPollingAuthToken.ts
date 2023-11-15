import { fetchAuthToken } from './fetchAuthToken';
import { startPolling } from '../utils/startPolling';
import { logger } from '../global/logger';
import { eventBus, events } from '../global/eventBus';

const hoursToMilliseconds = (hours: number): number => hours * 60 * 60 * 1000;
const minutesToMilliseconds = (minutes: number): number => minutes * 60 * 1000;

const AUTH_TOKEN_VALIDITY_TIME = hoursToMilliseconds(12);
const REFRESH_TOKEN_OFFSET = minutesToMilliseconds(5);
const POLL_INTERVAL = AUTH_TOKEN_VALIDITY_TIME - REFRESH_TOKEN_OFFSET;

export const startPollingAuthToken = () => {
  logger.debug('[Auth Token] start polling');
  startPolling(async () => fetchAuthToken(), { pollInterval: POLL_INTERVAL });
  eventBus.on(events.auth.tokenInvalid, () => {
    logger.debug('[Auth Token] invalid token. Fetching token again');
    fetchAuthToken().catch(() => {});
  });
};
