const chalk = require('chalk');
const latestVersion = require('latest-version');
const semver = require('semver');
import packageJson from '../../package.json';

export default (timeout = 2000) => {
  const currentVersion = packageJson.version;

  return Promise.race([
    new Promise(resolve => setTimeout(resolve, timeout)),
    latestVersion('viewar-cli').then(version => {
      if (!semver.satisfies(currentVersion, `>=${version}`)) {
        console.log(
          chalk.red.bold(
            `\Your installed viewar-cli version (${currentVersion}) is not up to date.\nPlease install the latest version (${version}) from npm.\n\thttps://www.npmjs.com/package/viewar-cli.`
          )
        );
      }
    }),
  ]);
};
