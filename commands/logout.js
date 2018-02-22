const { updateJson } = require('../common/json')
const { cliConfigPath } = require('../common/constants')

module.exports = async (username) => {
  updateJson(cliConfigPath, (config) => {
    config.users = config.users || {}
    const userId = Object.keys(config.users).find((userId) => username === config.users[userId].name)

    if (config.users[userId]) {
      config.users[userId] = undefined
      console.log(`User ${username} logged out.`)
    } else {
      console.log(`User ${username} is not logged in!`)
    }

    return config
  })
}
