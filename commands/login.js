const crypto = require('crypto')
const hash = crypto.createHash('md5')
const inquirer = require('inquirer')
const request = require('request-promise')

const { updateJson } = require('../common/json')
const { cliConfigPath } = require('../common/constants')
const { getLoginUrl } = require('../common/urls')

module.exports = async (username) => {
  const validateUsername = (value) => /.+@.+\..+/.test(value)

  username = validateUsername(username) ? username : await inquirer.prompt([
    {
      type: 'input',
      message: 'Username',
      name: 'username',
      validate: validateUsername,
    },
  ]).username

  const {password} = await inquirer.prompt([
    {
      type: 'password',
      message: 'Password',
      name: 'password',
    },
  ])

  const passwordHash = hash.update(password).digest('hex')

  const response = await request.post(getLoginUrl(username, passwordHash)).then(JSON.parse)

  const {status, message, userId, token} = response

  if (status === 'ok') {
    updateJson(cliConfigPath, (config) => {
      config.users = config.users || {}
      config.users[userId] = {
        id: userId,
        name: username,
        token,
      }

      return config
    })
    console.log(`User ${username} logged in.`)
  } else {
    throw new Error(message)
  }
}
