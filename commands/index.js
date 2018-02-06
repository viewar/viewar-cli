const fs = require('fs')
const shell = require('shelljs')
const request = require('request-promise')
const archiver = require('archiver')

const uploadBundle = require('../common/upload-bundle')({request})
const zipDirectory = require('../common/zip-dir')({fs, archiver})
const {readJson, updateJson, writeJson} = require('../common/json')

const activate = require('./activate')({request, readJson})
const deploy = require('./deploy')({fs, shell, zipDirectory, uploadBundle, readJson, request})
const init = require('./init')({shell, updateJson, writeJson, fs})
const list = require('./list')({request, readJson})
const login = require('./login')({request, updateJson})
const logout = require('./logout')({request, updateJson})
const whoami = require('./whoami')({readJson})

module.exports = {
  activate,
  deploy,
  init,
  list,
  login,
  logout,
  whoami,
}
