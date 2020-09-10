import { cliConfigPath } from '../common/constants';
import { readJson } from '../common/json';
import logger from '../logger/logger';
const emojic = require('emojic');

export default async () => {
  logger.setInfo('whoami');

  const data = await readJson(cliConfigPath);

  if (!Object.values(data.users).length) {
    console.log(
      `${emojic.bustInSilhouette}  Not logged in yet. Please use the 'login' command first.`
    );
  }

  console.log(
    Object.values(data.users)
      .map(user => `${user.name} <${user.email}>`)
      .join('\n')
  );
};
