#!/usr/bin/env node

const program = require('commander')
const shell = require('shelljs')

const currentVersion = require('./package.json').version
const { deploy, init, initSample, list, login, logout, whoami } = require('./commands')

if (!shell.test('-f', '~/.viewar-cli')) {
  shell.exec('echo "{}" > ~/.viewar-cli')
}

program.version(currentVersion)

program
  .command('init [username] [type] [project-name]')
  .description('Prepares a new ViewAR project')
  .action(init)

program
  .command('init-sample <sample-name> [dir]')
  .description('Prepares a new ViewAR sample')
  .action(initSample)

program
  .command('login [username]')
  .description('Logs in user')
.action(login)

program
  .command('logout <username>')
  .description('Logs out user')
  .action(logout)

program
  .command('whoami')
  .description('List logged in user accounts')
  .action(whoami)

program
  .command('list <username>')
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
