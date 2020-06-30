const fs = require('fs');
const path = require('path');

import generateToken from '../common/generate-token';
import { updateJson } from '../common/json';
import logger from '../logger/logger';

export default async () => {
  logger.setInfo('generate');

  const projectDir = path.resolve(process.cwd());
  let appInfoPath = path.resolve(projectDir, 'viewar-config.json');
  if (!fs.existsSync(appInfoPath)) {
    appInfoPath = path.resolve(projectDir, '.viewar-config');
  }

  await updateJson(appInfoPath, data =>
    Object.assign(data, {
      id: generateToken(),
      token: generateToken(),
    })
  );
};
