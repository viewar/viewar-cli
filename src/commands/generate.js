const path = require('path');

import generateToken from '../common/generate-token';
import { updateJson } from '../common/json';

export default async () => {
  const projectDir = path.resolve(process.cwd());
  const appInfoPath = path.resolve(projectDir, '.viewar-config');

  updateJson(appInfoPath, data =>
    Object.assign(data, {
      id: generateToken(),
      token: generateToken(),
    })
  );
};
