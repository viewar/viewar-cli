const chalk = require('chalk')

module.exports = (message, errorCode = 1) => {
  console.error(chalk`{red ERROR: ${message}}`)
  process.exit(errorCode)
}
