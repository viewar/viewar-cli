const path = require('path');
import { updateJson } from '../common/json';

export default async (appId, appVersion) => {
  const projectDir = path.resolve(process.cwd());
  const cliConfigPath = path.resolve(projectDir, '.viewar-config');

  updateJson(cliConfigPath, data =>
    Object.assign(data, {
      appId,
      appVersion,
    })
  );
};
