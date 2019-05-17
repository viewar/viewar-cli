import logger from '../logger/logger';

/**
 * Has to be async to avoid program continuing while server exception loggin is in progress.
 */
export default async (message, showAdvancedHint = true, errorCode = 1) => {
  logger.logError(message, showAdvancedHint);
  await logger.logErrorToServer(message);
  process.exit(errorCode);
};
