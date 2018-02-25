const os = require('os')

const cliConfigPath = `${os.homedir()}/.viewar-cli`
const defaultCliConfig = {
  users: {},
}
const repositoryUrl = 'https://github.com/viewar/viewar-boilerplate.git'

module.exports = {
  cliConfigPath,
  defaultCliConfig,
  repositoryUrl,
}
