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
const deploy = require('../commands/deploy')

const projectTypes = {
  'Vanilla Javascript': 'vanilla',
  'React': 'react',
  'Sample project': 'sample',
}

const sampleProjects = {
  'Base6': 'base6',
  'QR Navigation': 'qrnavigation',
  'Vanilla sample': 'vanilla',
  'Other...': 'other',
}

module.exports = async (userEmail, projectType) => {

  const projectDir = path.resolve(process.cwd())
  const packageInfoPath = path.resolve(projectDir, 'package.json')
  const cliConfigPath = path.resolve(projectDir, '.viewar-config')

  const dirEmpty = shell.ls(projectDir).length === 0;

  if (!dirEmpty) {
    exitWithError('Directory not empty!')
  }

  const projectName = process.cwd().split(path.sep).pop()

  const userList = Object.values(readJson(cliConfigFile).users || {})

  if (userList.length === 0) {
    exitWithError('There are no users logged in! Run "viewar-cli login" first!')
  }

  const enteredUser = userEmail && userList.find(user => user.email === userEmail)

  if (userEmail && !enteredUser) {
    exitWithError(`User with email ${userEmail} is not logged in!  Run viewar-api whoami to see which user accounts are logged in!`)
  }
  
  console.log(chalk`\nWelcome to ViewAR app initialization process!\n`);

  const user = enteredUser ? enteredUser : (userList.length === 1 ? userList[0] : null);

  if (user) {
    if (enteredUser) {
      console.log(`Logged in as: ${user.name} <${user.email}>`)
    } else {
      console.log(`Only one user account found, using this one: ${user.name} <${user.email}>`)
    }
  }

  const answers = await inquirer.prompt([
    {
      name: 'token',
      type: 'list',
      message: 'Select the user account for this app:',
      choices: userList.map(({name, email}) => `${name} <${email}>`),
      filter: (choice) => userList.find(({name, email}) => `${name} <${email}>` === choice).token,
      when: () => !user,
    },
    {
      name: 'type',
      type: 'list',
      message: 'Select a project type:',
      choices: Object.keys(projectTypes),
      filter: (value) => projectTypes[value],
      when: () => !projectType,
    },
    {
      name: 'sample',
      type: 'list',
      message: 'Select a sample project',
      choices: Object.keys(sampleProjects),
      filter: (value) => sampleProjects[value],
      when: ({type}) => projectType === projectTypes['Sample project'] || type === projectTypes['Sample project'],
    },
    {
      name: 'sampleUrl',
      type: 'input',
      message: 'Repository URL',
      when: ({sample}) => sample === sampleProjects['Other...'],
    },
    {
      name: 'appId',
      type: 'input',
      message: 'Enter the app bundle ID:',
      validate: (value) => /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+$/.test(value),
    },
    {
      name: 'version',
      type: 'input',
      message: 'Enter the app version:',
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

  const {token, type, appId, version, trackers, sample, sampleUrl} = Object.assign({
    token: user && user.token,
    type: projectType,
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
    name: projectName,
    description: '',
  }))

  writeJson(cliConfigPath, {
    id: generateToken(),
    token: generateToken(),
    appId,
    version,
  })

  await deploy(appId, version, 'initial')

  console.log(chalk`\n  App bundle ID: {yellow ${appId}} Version: {yellow ${version}}`)
  console.log(chalk`\n  Use the {yellow ViewAR SDK app} from Appstore/Playstore to test your app on a device.`)
  console.log(chalk`\n  Visit {yellow https://webversion.viewar.com/${appId}/${version}/} to run your app in the browser.`)
  console.log(chalk`\n  Run {yellow npm run start} to start the local development server with WebGL support.`)
  console.log(chalk`\n  Run {yellow npm run start:mock} to start the local development server without WebGL support (mock mode).`)
  
}
