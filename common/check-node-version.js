var chalk = require('chalk');
var package = require('package')(module); // contains package.json data.
var semver = require('semver');

module.exports = () => {
  var version = package.engines.node;
  if (!semver.satisfies(process.version, version)) {
    console.log(
      chalk.red.bold(
        `\Required node version ${version} not satisfied with current version ${
          process.version
        }. Please update your node.js`
      )
    );
    process.exit(1);
  }
};
