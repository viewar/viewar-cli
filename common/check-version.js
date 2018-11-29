const chalk = require('chalk');
const currentVersion = require('../package.json').version;
const latestVersion = require('latest-version');
const semver = require('semver');

module.exports = (timeout = 2000) => Promise.race([
    new Promise(resolve => setTimeout(resolve, timeout)),
    latestVersion('viewar-cli').then(version => {
      console.log(version, currentVersion);
      if (!semver.satisfies(currentVersion, `>=${version}`)) {
        console.log(chalk.red.bold(`\Your installed viewar-cli version (${currentVersion}) is not up to date.\nPlease install the latest version (${version}) from npm.\n\thttps://www.npmjs.com/package/viewar-cli.`));
      }
    })
  ]);