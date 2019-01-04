const program = require('commander');
const shell = require('shelljs');

const currentVersion = require('./package.json').version;
const {
  deploy,
  init,
  list,
  login,
  logout,
  generate,
  set,
  whoami,
} = require('./commands');
const { writeJson } = require('./common/json');
const { cliConfigPath, defaultCliConfig } = require('./common/constants');
const checkVersion = require('./common/check-version');

if (!shell.test('-f', cliConfigPath)) {
  writeJson(cliConfigPath, defaultCliConfig);
}

checkVersion().then(() => {
  program.version(currentVersion);

  program
    .command('init [folder] [type] [user-email]')
    .description('Prepares a new ViewAR project')
    .action(init);

  program
    .command('generate')
    .alias('generate-token')
    .description('Generates new upload token')
    .action(generate);

  program
    .command('set <app-id> <app-version>')
    .description('Sets app bundle ID and version')
    .action(set);

  program
    .command('login [user-email]')
    .description('Logs in user')
    .action(login);

  program
    .command('logout <user-email>')
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

  if (
    !program.commands
      .map(cmd => cmd._name)
      .includes(program.args.map(cmd => cmd && cmd._name).filter(x => x)[0])
  ) {
    console.log(
      `viewar-cli: '${program.args[0]}' is not a viewar-cli command.`
    );
    program.help();
  }
});
