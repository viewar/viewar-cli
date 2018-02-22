const path = require('path')
const request = require('request-promise')

const { readJson } = require('../common/json')
const { getAppConfigUrl, getActivateUrl } = require('../common/urls')
const { cliConfigPath } = require('../common/constants')

module.exports = async (appId, version) => {

  const info = await request(getAppConfigUrl(appId, version)).then(JSON.parse)

  if (!info) {
    throw new Error('Wrong bundle ID or version!')
  }

  const ownerId = info.config.channel

  const data = readJson(cliConfigPath)

  const entry = (data.users || {})[ownerId]

  if (!entry) {
    throw new Error(`App owner is not logged in!`)
  }

  const appToken = readJson(path.resolve(process.cwd(), '.viewar-config')).token

  const response = await request.post(getActivateUrl(entry.token, appId, version, appToken)).then(JSON.parse)

  const {status, message} = response

  if (status === 'ok') {
    console.log('App activated.')
  } else {
    throw new Error(message)
  }
}
