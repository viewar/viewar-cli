const crypto = require('crypto')
const hash = crypto.createHash('md5')

const { cliConfigPath } = require('../common/constants')
const { getLoginUrl } = require('../common/urls')

module.exports = ({request, updateJson}) => async (username, password) => {

  const passwordHash = hash.update(password).digest('hex')

  const response = await request.post(getLoginUrl(username, passwordHash)).then(JSON.parse)

  const {status, message, userId, token} = response

  if (status === 'ok') {
    updateJson(cliConfigPath, (config) => {
      config.users = config.users || {}
      config.users[userId] = {
        id: userId,
        name: username,
        token
      }

      return config
    })
    console.log(`User ${username} logged in.`)
  } else {
    throw new Error(message)
  }
}
