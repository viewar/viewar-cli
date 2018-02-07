const crypto = require('crypto')
const hash = crypto.createHash('md5')
const prompt = require('prompt')

const {cliConfigPath} = require('../common/constants')
const {getLoginUrl} = require('../common/urls')

module.exports = ({request, updateJson}) => async () => {

  try {
    const {username, password} = await (new Promise((resolve, reject) => {
      prompt.start()
      prompt.message = ''
      prompt.delimiter = ':'

      prompt.get([{
        name: 'username',
        description: 'Username',
        pattern: /.+@.+\..+/,
        required: true,
      }, {
        name: 'password',
        description: 'Password',
        hidden: true,
      }], function (error, result) {
        if (!error) {
          resolve(result)
        } else {
          reject(error)
        }
      })
    }))

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
  } catch (error) {

  }
}
