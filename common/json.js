const fs = require('fs')

const exitWithError = require('./exit-with-error')

const readJson = (filename, errorMessage) => {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'))
  } catch (error) {
    exitWithError(errorMessage || `File ${filename} does not exists or is not valid JSON file!`)
  }
}

const writeJson = (filename, object, errorMessage) => {
  try {
    fs.writeFileSync(filename, JSON.stringify(object, null, '  '), 'utf8')
  } catch (error) {
    exitWithError(errorMessage || `File ${filename} could not be written!`)
  }
}

const updateJson = (path, fn) => {
  writeJson(path, fn(readJson(path)))
}

module.exports = {
  readJson,
  updateJson,
  writeJson,
}
