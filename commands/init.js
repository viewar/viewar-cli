const chalk = require('chalk')
const path = require('path')

const generateToken = require('../common/generate-token')

const {repositoryUrl} = require('../common/constants')

module.exports = ({shell, updateJson, writeJson}) => async (projectName = '.', type = 'vanilla') => {
  const projectDir = path.resolve(process.cwd(), projectName)
  const packageInfoPath = path.resolve(projectDir, 'package.json')
  const cliConfigPath = path.resolve(projectDir, '.viewar-config')

  if (shell.mkdir('-p', projectDir).code !== 0) {
    if (!shell.test('-d', projectDir)) {
      throw new Error(`${projectDir} exists and is not a directory!`)
    }
  }

  shell.cd(projectDir)

  const dirEmpty = shell.ls(projectDir).length === 0;

  if (shell.ls(projectDir).length === 0) {
    console.log(chalk`\nDownloading boilerplate project...`)

    shell.exec(`git clone -b master ${repositoryUrl} temp`, {silent: true})
    shell.mv(`./temp/${type}/*`, `.`)
    shell.rm('-rf', 'temp')

    console.log(chalk`\nInstalling dependencies...`)

    if (shell.exec('npm install', {silent: true}).code !== 0) {
      throw new Error(`Failed installing npm dependencies! Check if npm is installed and up-to-date.`)
    }

    console.log(chalk`\nInitializing git repository...`)

    if (shell.exec('git init', {silent: true}).code !== 0) {
      throw new Error(`Git repository initialization failed! Check if git is installed.`)
    }

    updateJson(packageInfoPath, (object) => Object.assign(object, {
      name: projectName,
      description: '',
    }))
  } else {
    console.log(chalk`\nExisting files detected in directory ${projectDir}, writing .viewar-config`)
  }

  if (shell.test('-f', '.viewar-config')) {
    shell.mv('.viewar-config', `.viewar-config.old.${generateToken()}`)
  }

  writeJson(cliConfigPath, {
    id: generateToken(),
    token: generateToken(),
  })

  if (dirEmpty) {
    console.log(chalk`\n{bold Done!}\n  Enter the new project directory by running {green cd ${projectName}}\n  Run {green npm start} to start the development server (defaults to {green localhost:8080 })\n  Open {green /src/index.js} to begin editing your app.`)
  } else {
    console.log(chalk`\n{bold Done!}`)
  }
}
