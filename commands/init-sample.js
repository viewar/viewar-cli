const chalk = require('chalk')
const path = require('path')

const generateToken = require('../common/generate-token')

const { getRepositoryUrl } = require('../common/urls')

module.exports = ({shell, updateJson, writeJson}) => async (sampleName, directory) => {
  const projectDir = path.resolve(process.cwd(), directory || sampleName)
  const packageInfoPath = path.resolve(projectDir, 'package.json')
  const cliConfigPath = path.resolve(projectDir, '.viewar-config')

  console.log(chalk`\nChecking out sample project...`)

  shell.exec(`git clone -b master ${getRepositoryUrl(sampleName)} ${directory}`, {silent: true})

  console.log(chalk`\nInstalling dependencies...`)

  shell.cd(projectDir)

  if (shell.exec('npm install', {silent: true}).code !== 0) {
    throw new Error(`Failed installing npm dependencies! Check if npm is installed and up-to-date.`)
  }

  updateJson(packageInfoPath, (object) => Object.assign(object, {
    name: sampleName,
    description: '',
  }))

  if (shell.test('-f', '.viewar-config')) {
    shell.mv('.viewar-config', `.viewar-config.old.${generateToken()}`)
  }

  writeJson(cliConfigPath, {
    id: generateToken(),
    token: generateToken(),
  })

  console.log(chalk`\n{bold Done!}`)
}
