const path = require('path')

const generateToken = require('../common/generate-token')
const { updateJson } = require('../common/json')

module.exports = async () => {
  const projectDir = path.resolve(process.cwd())
  const appInfoPath = path.resolve(projectDir, '.viewar-config')

  updateJson(appInfoPath, (data) => Object.assign(data, {
    id: generateToken(),
    token: generateToken(),
  }))
}
