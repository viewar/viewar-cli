#!/usr/bin/env node

const program = require('commander')
const shell = require('shelljs')

const currentVersion = require('./package.json').version
const { deploy, init, list, login, logout, whoami } = require('./commands')

if (!shell.test('-f', '~/.viewar-cli')) {
  shell.exec('echo "{\n  "users": {}\n}" > ~/.viewar-cli')
}

program.version(currentVersion)

program
  .command('init [user-email] [type]')
  .description('Prepares a new ViewAR project')
  .action(init)

program
  .command('login [user-email]')
  .description('Logs in user')
  .action(login)

program
  .command('logout <user-email>')
  .description('Logs out user')
  .action(logout)

program
  .command('whoami')
  .description('List logged in user accounts')
  .action(whoami)

program
  .command('list <user-email>')
  .description('List available apps')
  .action(list)

program
  .command('deploy <app-id> <version> [tags]')
  .description('Deploys the project')
  .action(deploy)

if (process.argv.length < 3) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
