#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const archiver = require('archiver')
const path = require('path')
const shell = require('shelljs')
const semver = require('semver')
const request = require('request')

const packageInfo = require('./package.json')
const currentVersion = packageInfo.version

const repo = 'https://github.com/viewar/viewar-boilerplate.git'

const gitIgnore = `node_modules/
.viewar-config
`

//======================================================================================================================

;(async function () {
  try {
    const args = process.argv.slice(2)

    console.log(chalk`{bold ViewAR SDK Command Line Interface v${currentVersion}}`)

    const latestVersion = shell.exec('npm show viewar-cli version', {silent: true}).stdout.trim()

    if (semver.gt(latestVersion, currentVersion)) {
      console.log(chalk`{bold 
A newer version is available: ${latestVersion}!} Update now by running:
  {green npm update -g viewar-cli}`)
    }

    switch (args[0] || '') {
      case '':
      case 'help':
        printUsage()
        break
      case 'init':
      case 'init-vanilla':
        await init(args[1], 'vanilla', args[2])
        break
      case 'init-react':
        await init(args[1], 'react', args[2])
        break
      case 'deploy':
        await deploy(args[1])
        break
      case 'display-version':
        displayVersion()
        break
      case 'set-version':
        setVersion(args[1])
        break
      case 'display-token':
        displayToken()
        break
      case 'set-token':
        setToken(args[1])
        break
      default:
        console.log('Unsupported command: ' + args[0])
        printUsage()
        return process.exit(1)
    }
  } catch (error) {
    console.error(error)
    return process.exit(1)
  }
  return process.exit(0)
}())

//======================================================================================================================

function printUsage () {
  console.log(chalk`
Usage:
  viewar-cli init {green [project name]}\tCreates a new plain JavaScript ViewAR project
  viewar-cli init-react {green [project name]}\tCreates a new React ViewAR project
  
  viewar-cli display-token \t\tDisplays the token of the project
  viewar-cli set-token {green [token]}\t\tSets a specific token for the project

  viewar-cli display-version \t\tDisplays the version of the project
  viewar-cli set-version {green [version]} \tSets the version for the project
  
  viewar-cli deploy {green [version]}	\tDeploys the project
  
  viewar-cli help {green [version]} \t\tDisplays this message
`)
}

async function init (projectName, type, token) {
  const projectDir = createProjectDir(projectName)
  shell.cd(projectDir)

  console.log(chalk.bold('\nDownloading boilerplate project...'))

  shell.exec(`git clone -b master ${repo} temp`, {silent: true})
  shell.mv(`./temp/${type}/*`, `.`)
  shell.rm('-rf', 'temp')

  console.log(chalk.bold('\nInstalling dependencies...'))

  shell.exec('npm install', {silent: true})

  console.log(chalk.bold('\nInitializing git repository...'))

  shell.exec('git init', {silent: true})
  fs.writeFileSync('.gitignore', gitIgnore, 'utf8')

  Object.assign(packageInfo, {
    name: projectName,
    version: '0.1.0',
    description: '',
  })

  writeJson(path.resolve(process.cwd(), 'package.json'), packageInfo)

  const config = {
    token: token || `${Math.random().toString(36).slice(2)}-0.1.0_${Math.random().toString(36).slice(2)}`,
    version: '0.1.0',
  }

  writeJson(path.resolve(process.cwd(), '.viewar-config'), config)

  console.log(chalk`
{bold Done!}
  Your app token is: {green ${config.token}}
  Add the token in the settings at {red developer.viewar.com}
  After that, enter the new project directory by running {green cd ${projectName}}
  Run {green npm start} to start the development server (defaults to {green localhost:8080 })
  Open {green /src/index.js} to begin editing your app.`)
}

function createProjectDir (projectName) {
  const projectDir = path.join(process.cwd(), projectName)

  try {
    fs.statSync(projectDir)
  } catch (error) {
    fs.mkdirSync(projectDir)
    return projectDir
  }

  throw new Error(`A ${(stat.isDirectory() ? 'directory'
    : 'file')} named ${projectName} already exists! Exiting without creating a new project.`)
}

async function deploy (version) {
  console.log(chalk`Bundling app...`)
  shell.exec('npm run build', {silent: true})
  await zip(process.cwd())
  const oldVersion = get('version')
  version && setVersion(version, {silent: true})
  const config = readConfig()
  console.log(chalk`Uploading app bundle...`)
  await uploadBundle(config.token, `${process.cwd()}/bundle.zip`)
  version && setVersion(oldVersion, {silent: true})
  shell.rm('-rf', `${process.cwd()}/bundle.zip`)
  shell.rm('-rf', `${process.cwd()}/build`)
  console.log(chalk`{bold Done!}`)
}

function zip (appRoot) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${appRoot}/bundle.zip`)

    output.on('close', resolve)
    output.on('error', reject)

    const archive = archiver('zip', {})
    archive.pipe(output)
    archive.directory(`${appRoot}/build/`, false)
    archive.finalize()
  })
}

function uploadBundle (token, path) {
  return new Promise((resolve, reject) => {
    const url = 'http://dev2.viewar.com/resources/AppfilesUpload'
    const formData = {
      token,
      file: fs.createReadStream(path),
    }
    request.post({url, formData}, (error) => error ? reject(error) : resolve())
  })
}

function displayVersion () {
  console.log(`Current app version is ${chalk.green(get('version'))}`)
}

function displayToken () {
  console.log(`Current app token is ${chalk.green(get('token'))}`)
}

function get (property) {
  const config = readConfig()
  return config[property]
}

function readConfig () {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.viewar-config'), 'utf8'))
  } catch (error) {
    throw new Error(chalk.red('File .viewar-config not found! Are you in a project directory generated by the viewar-cli?'))
  }
}

function setToken (token, {silent} = {}) {
  if (!token) {
    throw new Error(chalk.red('Please provide a new token!'))
  }
  const config = readConfig()
  if (!config) return

  const newConfig = Object.assign({}, config, {
    token,
    version: token.split('-')[1].split('_')[0],
  })

  writeJson(path.resolve(process.cwd(), '.viewar-config'), newConfig)

  if (!silent) {
    console.log(chalk`{bold Done!}
Your new token is: {green ${newConfig.token}}
Do not forget to update the token in the settings at {red developer.viewar.com}`)
  }
}

function setVersion (version, {silent} = {}) {

  if (!version) {
    throw new Error(chalk.red('Please provide a new token!'))
  }

  const config = readConfig()
  if (!config) return 1

  const token = get('token')

  const newConfig = Object.assign({}, config, {
    token: token.split('-')[0] + '-' + version + '_' + token.split('_')[1],
    version,
  })

  writeJson(path.resolve(process.cwd(), '.viewar-config'), newConfig)

  if (!silent) {
    console.log(chalk`{bold Done!}
Your new version is: {green ${newConfig.version}}
Your new token is: {green ${newConfig.token}}
Do not forget to update the token in the settings at {red developer.viewar.com}`)
  }
}

function writeJson (filename, object) {
  fs.writeFileSync(filename, JSON.stringify(object, null, '  '), 'utf8')
}
