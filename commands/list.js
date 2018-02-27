const request = require('request-promise')
const Table = require('easy-table')

const exitWithError = require('../common/exit-with-error')
const { readJson } = require('../common/json')
const { getListAppsUrl } = require('../common/urls')
const { cliConfigPath } = require('../common/constants')

module.exports = async (email) => {
  const data = readJson(cliConfigPath)

  const users = Object.values(data.users || {}).filter((user) => !email || user.email.includes(email))

  if (!users.length) {
    exitWithError(`User ${email} is not logged in!`)
  }

  for (const {id, name, email, token}  of users) {

    const response = await request.post(getListAppsUrl(id, token)).then(JSON.parse)

    const {status, message, apps} = response

    if (status === 'ok') {
      const table = new Table()

      apps.forEach(({bundleIdentifier, version}) => {
        table.cell('App bundle ID', bundleIdentifier)
        table.cell('Version', version)
        table.newRow()
      })

      console.log(`--------------------------------------------------------------------------------`)
      console.log(`Apps for user ${name} <${email}>`)
      console.log(`--------------------------------------------------------------------------------`)
      console.log(table.toString())
    } else {
      exitWithError(message)
    }
  }
}
