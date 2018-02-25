const { cliConfigPath } = require('../common/constants')
const { readJson } = require('../common/json')

module.exports = () => {
  const data = readJson(cliConfigPath)
  console.log(Object.values(data.users).map(user => `${user.name} <${user.email}>`).join('\n'))
}
