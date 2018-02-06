const fs = require('fs')

const readJson = (filename, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'))
  } catch (error) {
    if (fallback) {
      return fallback
    } else {
      throw error
    }
  }
}

const writeJson = (filename, object) => {
  return fs.writeFileSync(filename, JSON.stringify(object, null, '  '), 'utf8')
}

const updateJson = (path, fn) => {
  writeJson(path, fn(readJson(path)))
}

module.exports = {
  readJson,
  updateJson,
  writeJson,
}
