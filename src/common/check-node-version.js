import logger from '../logger/logger';

const check = require('check-node-version');
const process = require('process');

const requirements = {
  node: '>= 8',
};

export default () => {
  return new Promise(resolve => {
    check(requirements, (error, results) => {
      if (error) {
        console.error(error);
        resolve();
        return;
      }

      if (results.isSatisfied) {
        resolve();
        return;
      }

      for (const packageName of Object.keys(results.versions)) {
        if (!results.versions[packageName].isSatisfied) {
          const version = requirements[packageName];
          logger.logError(
            `\Required ${packageName} version ${version} not satisfied with current version ${
              process.version
            }. Please update your node.js`,
            false
          );
        }
      }

      process.exit(1);
    });
  });
};
