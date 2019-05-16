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

/**
 * Check if file exists before accessing it. Returns undefined if file does not exist.
 * Mainly used for server logging upon exception (without throwing a new exception).
 */
export const readJsonSafe = filename => {
  try {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(filename, 'utf8'));
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
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
