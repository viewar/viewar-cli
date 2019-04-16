import chalk from 'chalk';
import check from 'check-node-version';
import process from 'process';

const requirements = {
  node: '>= 8',
};

export default () => {
  check(requirements, (error, results) => {
    if (error) {
      console.error(error);
      return;
    }

    if (results.isSatisfied) {
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
};
