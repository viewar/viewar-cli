const fs = require('fs');
const path = require('path');
import { updateJson } from '../common/json';
import logger from '../logger/logger';

export default async (appId, appVersion) => {
  logger.setInfo('set', {
    appId,
    appVersion,
  });

  const projectDir = path.resolve(process.cwd());
  let cliConfigPath = path.resolve(projectDir, '.viewar-config.json');
  if (!fs.existsSync(cliConfigPath)) {
    cliConfigPath = path.resolve(projectDir, '.viewar-config');
  }

  await updateJson(cliConfigPath, data =>
    Object.assign(data, {
      appId,
      appVersion,
    })
  );
};
