#!/usr/bin/env node

const program = require('commander')
const shell = require('shelljs')

const currentVersion = require('./package.json').version
const { deploy, init, list, login, logout, whoami } = require('./commands')

if (!shell.test('-f', '~/.viewar-cli')) {
  shell.exec('echo "{}" > ~/.viewar-cli')
}

program.version(currentVersion)

program
  .command('init [project-name] [type]')
  .description('Prepares a new ViewAR project')
  .action(init)

program
  .command('login')
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
  .command('deploy <app-id> <version>')
  .description('Deploys the project')
  .action(deploy)

if (process.argv.length < 3) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
