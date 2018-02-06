const { cliConfigPath } = require('../common/constants')

module.exports = ({readJson}) => () => {
  const data = readJson(cliConfigPath)
  console.log(Object.values(data.users).map(user => user.name).join('\n'))
}
