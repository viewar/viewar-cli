import logger from '../logger/logger';

const chalk = require('chalk');

/**
 * Has to be async to avoid program continuing while server exception loggin is in progress.
 */
export default async (message, errorCode = 1) => {
  console.error(chalk`{red ERROR: ${message}}`);
  await logger.logErrorToServer(message);
  process.exit(errorCode);
};
