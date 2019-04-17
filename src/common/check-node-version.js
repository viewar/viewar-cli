const chalk = require('chalk');
const check = require('check-node-version');
const process = require('process');

const requirements = {
  node: '>= 8',
};

export default async () => {
  await new Promise(resolve => {
    check(requirements, (error, results) => {
      if (error) {
        console.error(error);
        return;
      }

      if (results.isSatisfied) {
        resolve();
        return;
      }

      for (const packageName of Object.keys(results.versions)) {
        if (!results.versions[packageName].isSatisfied) {
          const version = requirements[packageName];
          console.log(
            chalk.red.bold(
              `\Required ${packageName} version ${version} not satisfied with current version ${
                process.version
              }. Please update your node.js`
            )
          );
        }
      }

      process.exit(1);
    });
  });
};
