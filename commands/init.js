const chalk = require('chalk')
const path = require('path')
const shell = require('shelljs')
const inquirer = require('inquirer')
const request = require('request-promise')

const exitWithError = require('../common/exit-with-error')
const generateToken = require('../common/generate-token')
const { readJson, updateJson, writeJson } = require('../common/json')
const { createAppUrl, getRepositoryUrl } = require('../common/urls')
const { cliConfigPath: cliConfigFile, repositoryUrl } = require('../common/constants')

module.exports = async (username, projectType, projectName) => {

  const projectDir = path.resolve(process.cwd())
  const packageInfoPath = path.resolve(projectDir, 'package.json')
  const cliConfigPath = path.resolve(projectDir, '.viewar-config')

  const dirEmpty = shell.ls(projectDir).length === 0;

  if (!dirEmpty) {
    exitWithError('Directory not empty!')
  }

  const userList = Object.values(readJson(cliConfigFile).users || {})

  if (userList.length === 0) {
    exitWithError('There are no logged-in users! Run viewar-api login first!')
  }

  const user = username && userList.find(user => user.name === username)

  if (username && !user) {
    exitWithError(`User ${username} is not logged in!`)
  }

  const userToken = username && userList.find(user => user.name === username).token

  const answers = await inquirer.prompt([
    {
      name: 'token',
      type: 'list',
      message: 'User',
      choices: userList,
      filter: (username) => userList.find(user => user.name === username).token,
      when: () => !username,
    },
    {
      name: 'type',
      type: 'list',
      message: 'Project type',
      choices: [
        {
          name: 'Vanilla',
        },
        {
          name: 'React',
        },
        {
          name: 'Sample project',
        },
      ],
      filter: (value) => value.toLowerCase(),
      when: () => !projectType,
    },
    {
      name: 'sample',
      type: 'list',
      message: 'Sample project',
      choices: [
        {
          name: 'Base6',
        },
        {
          name: 'Other...',
        },
      ],
      filter: (value) => value.toLowerCase(),
      when: ({type}) => projectType === 'sample' || type === 'sample project',
    },
    {
      name: 'sampleUrl',
      type: 'input',
      message: 'Repository URL',
      when: ({sample}) => sample === 'Other...',
    },
    {
      name: 'name',
      type: 'input',
      message: 'Project name',
      validate: (value) => value !== '',
      when: () => !projectName,
    },
    {
      name: 'appId',
      type: 'input',
      message: 'App ID',
      validate: (value) => /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+$/.test(value),
    },
    {
      name: 'version',
      type: 'input',
      message: 'App version',
      default: '1.0',
      //validate: (value) => /\d+(?:\.\d+(?:\.\d+)?)?/.test(value),
      validate: (value) => /\d+(?:\.\d+)?/.test(value),
    },
    {
      name: 'trackers',
      type: 'checkbox',
      message: 'Choose trackers',
      choices: [
        {
          name: 'ARKit',
        },
        {
          name: 'Vuforia',
        },
        {
          name: 'Wikitude',
        },
      ],
    },
  ])

  const {token, name, type, appId, version, trackers, sample, sampleUrl} = Object.assign({
    token: userToken,
    type: projectType,
    name: projectName,
  }, answers)

  const formData = {
    bundleIdentifier: appId,
    version,
    token,
    tracker: trackers.join(','),
  }

  console.log(chalk`\nCreating app...`)

  await request.post({uri: createAppUrl(), formData})

  if (sampleUrl || sample) {
    console.log(chalk`\nChecking out sample project...`)

    shell.exec(`git clone -b master ${sampleUrl || getRepositoryUrl(sample)} .`, {silent: true})
  } else {
    console.log(chalk`\nDownloading boilerplate project...`)

    shell.exec(`git clone -b master ${repositoryUrl} temp`, {silent: true})
    shell.mv(`./temp/${type}/*`, `.`)
    shell.rm('-rf', 'temp')
  }

  console.log(chalk`\nInstalling dependencies...`)

  if (shell.exec('npm install', {silent: true}).code !== 0) {
    exitWithError(`Failed installing npm dependencies! Check if npm is installed and up-to-date.`)
  }

  console.log(chalk`\nInitializing git repository...`)

  if (shell.exec('git init', {silent: true}).code !== 0) {
    exitWithError(`Git repository initialization failed! Check if git is installed.`)
  }

  updateJson(packageInfoPath, (object) => Object.assign(object, {
    name,
    description: '',
  }))

  writeJson(cliConfigPath, {
    id: generateToken(),
    token: generateToken(),
    appId,
    version,
  })

  console.log(chalk`\n{bold Done!}\n  Run {green npm start} to start the development server (defaults to {green localhost:8080 })\n  Open {green /src/index.js} to begin editing your app.`)
}
