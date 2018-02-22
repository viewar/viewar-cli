module.exports = (message, errorCode = 1) => {
  console.error(message)
  process.exit(errorCode)
}

