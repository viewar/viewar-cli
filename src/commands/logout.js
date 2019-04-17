import exitWithError from '../common/exit-with-error';
import { updateJson } from '../common/json';
import { cliConfigPath } from '../common/constants';

export default async email => {
  if (!email) {
    exitWithError(
      'No email address given. Please provide an email address as first argument.'
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
      console.log(`User ${email} is not logged in!`);
    }

    return config;
  });
};
