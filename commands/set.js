const path = require('path')
const { updateJson } = require('../common/json')

module.exports = async (appId, appVersion) => {
  const projectDir = path.resolve(process.cwd())
  const cliConfigPath = path.resolve(projectDir, '.viewar-config')

  updateJson(cliConfigPath, (data) => Object.assign(data, {
    appId,
    appVersion,
  }))
}
