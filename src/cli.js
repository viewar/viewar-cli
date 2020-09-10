const program = require('commander');
const shell = require('shelljs');
const chalk = require('chalk');

import packageJson from '../package.json';
const currentVersion = packageJson.version;

import init from './commands/init';
import deploy from './commands/deploy';
import list from './commands/list';
import login from './commands/login';
import logout from './commands/logout';
import generate from './commands/generate';
import set from './commands/set';
import whoami from './commands/whoami';

import { writeJson } from './common/json';
import { cliConfigPath, defaultCliConfig } from './common/constants';
import checkVersion from './common/check-version';
import logger from './logger/logger.js';

export default () => {
  if (!shell.test('-f', cliConfigPath)) {
    writeJson(cliConfigPath, defaultCliConfig);
  }

  checkVersion().then(() => {
    program.version(currentVersion);
    program.option('-l, --log', 'Advanced error logging');
    program.option('-s, --server', 'Log errors to server');
    program.option(
      '-f, --force',
      'Force deployment of already existing app versions.'
    );

    program
      .command('init [folder] [type] [user-email]')
      .description('Prepares a new ViewAR project')
      .action(init);

    program
      .command('generate')
      .description('Generates new upload token')
      .action(generate);

    program
      .command('set [app-id] [app-version]')
      .description('Sets app bundle ID and version')
      .action(set);

    program
      .command('login [user-email]')
      .description('Logs in user')
      .action(login);

    program
      .command('logout [user-email]')
      .description('Logs out user')
      .action(logout);

    program
      .command('whoami')
      .description('List logged in user accounts')
      .action(whoami);

    program
      .command('list [user-email]')
      .description('List available apps')
      .action(list);

    program
      .command('deploy [app-id] [app-version] [tags]')
      .description('Deploys the project')
      .action(deploy);

    program.parse(process.argv);

    logger.advancedLogging = !!program.log;
    logger.serverLogging = !!program.server;

    if (
      !program.commands
        .map(cmd => cmd._name)
        .includes(program.args.map(cmd => cmd && cmd._name).filter(x => x)[0])
    ) {
      if (program.args.length) {
        logger.logError(
          `@viewar/cli: '${program.args[0]}' is not a viewar-cli command.`,
          false
        );
      }
      program.help();
    }
  });
};
