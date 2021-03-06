import exitWithError from '../common/exit-with-error';
import { updateJson } from '../common/json';
import { cliConfigPath } from '../common/constants';
import logger from '../logger/logger';

export default async email => {
  logger.setInfo('logout', {
    email,
  });

  if (!email) {
    await exitWithError(
      'No email address given. Please provide an email address as first argument.',
      false
    );
  }

  updateJson(cliConfigPath, config => {
    config.users = config.users || {};

    const userId = Object.keys(config.users).find(
      userId => email === config.users[userId].email
    );

    if (config.users[userId]) {
      config.users[userId] = undefined;
      console.log(`User ${email} logged out.`);
    } else {
      exitWithError(`User ${email} is not logged in!`);
    }

    return config;
  });
};
