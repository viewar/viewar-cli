const request = require('request-promise')

const { readJson } = require('../common/json')
const { getListAppsUrl } = require('../common/urls')
const { cliConfigPath } = require('../common/constants')

module.exports = async (email) => {
  const data = readJson(cliConfigPath)

  const entry = Object.values(data.users || {}).find((user) => user.email === email)

  if (!entry) {
    return new Error(`User ${email} is not logged in!`)
  }

  const {id: userId, token} = entry

  const response = await request.post(getListAppsUrl(userId, token)).then(JSON.parse)

  const {status, message, apps} = response

  if (status === 'ok') {
    console.log(apps.map(({bundleIdentifier, version}) => `${bundleIdentifier}@${version}`).join('\n'))
  } else {
    throw new Error(message)
  }
}
