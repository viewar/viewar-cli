import fs from 'fs';

import exitWithError from './exit-with-error';

export const readJson = (filename, errorMessage) => {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    exitWithError(
      errorMessage ||
        `File ${filename} does not exists or is not valid JSON file!`
    );
  }
};

export const writeJson = (filename, object, errorMessage) => {
  try {
    fs.writeFileSync(filename, JSON.stringify(object, null, '  '), 'utf8');
  } catch (error) {
    exitWithError(errorMessage || `File ${filename} could not be written!`);
  }
};

export const updateJson = (path, fn) => {
  writeJson(path, fn(readJson(path)));
};
