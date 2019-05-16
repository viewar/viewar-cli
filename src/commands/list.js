const request = require('request-promise');
const Table = require('easy-table');

import exitWithError from '../common/exit-with-error';
import { readJson } from '../common/json';
import { getListAppsUrl } from '../common/urls';
import { cliConfigPath } from '../common/constants';
import logger from '../logger/logger';

export default async email => {
  logger.setInfo('list', {
    email,
  });

  const data = await readJson(cliConfigPath);

  const users = Object.values(data.users || {}).filter(
    user => !email || (user.email && user.email.includes(email))
  );

  if (!users.length) {
    await exitWithError(`User ${email} is not logged in!`);
  }

  for (const { id, name, email, token } of users) {
    const response = await request
      .post(getListAppsUrl(id, token))
      .then(JSON.parse);

    const { status, message, apps } = response;

    if (status === 'ok') {
      const table = new Table();

      apps &&
        apps.forEach(({ bundleIdentifier, version }) => {
          table.cell('App bundle ID', bundleIdentifier);
          table.cell('Version', version);
          table.newRow();
        });

      console.log(
        `--------------------------------------------------------------------------------`
      );
      console.log(`Apps for user ${name} <${email}>`);
      console.log(
        `--------------------------------------------------------------------------------`
      );
      console.log(table.toString());
    } else {
      await exitWithError(message);
    }
  }
};
