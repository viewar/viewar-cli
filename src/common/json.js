const fs = require('fs');

import exitWithError from './exit-with-error';

export const readJson = async (filename, errorMessage) => {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    await exitWithError(
      errorMessage ||
        `File ${filename} does not exists or is not valid JSON file!`
    );
  }
};

export const writeJson = async (filename, object, errorMessage) => {
  try {
    fs.writeFileSync(filename, JSON.stringify(object, null, '  '), 'utf8');
  } catch (error) {
    await exitWithError(
      errorMessage || `File ${filename} could not be written!`
    );
  }
};

export const updateJson = async (path, fn) => {
  const data = await readJson(path);
  writeJson(path, fn(data));
};
