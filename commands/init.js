const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const inquirer = require('inquirer');
const request = require('request-promise');

const exitWithError = require('../common/exit-with-error');
const generateToken = require('../common/generate-token');
const { readJson, updateJson, writeJson } = require('../common/json');
const { createAppUrl, getRepositoryUrl } = require('../common/urls');
const {
  cliConfigPath: cliConfigFile,
  repositoryUrl,
  projectTypes,
  sampleProjects,
} = require('../common/constants');
const deploy = require('../commands/deploy');

module.exports = async (directory, projectType, userEmail) => {
  let projectDir = path.resolve(process.cwd());
  if (directory) {
    projectDir += `/${directory}`;
    shell.mkdir('-p', projectDir);
  }

  const packageInfoPath = path.resolve(projectDir, 'package.json');
  const cliConfigPath = path.resolve(projectDir, '.viewar-config');
  const dirEmpty = shell.ls(projectDir).length === 0;

  if (!dirEmpty) {
    exitWithError('Directory not empty!');
  }

  shell.cd(projectDir);

  const projectName = directory
    ? directory
    : process
        .cwd()
        .split(path.sep)
        .pop();

  const { users = {}, overrides = {} } = readJson(cliConfigFile);

  const userList = Object.values(users);

  if (userList.length === 0) {
    exitWithError(
      'There are no users logged in! Run "viewar-cli login" first!'
    );
  }

  const enteredUser =
    userEmail && userList.find(user => user.email === userEmail);

  if (userEmail && !enteredUser) {
    exitWithError(
      `User with email ${userEmail} is not logged in!  Run viewar-api whoami to see which user accounts are logged in!`
    );
  }

  console.log(chalk`\nWelcome to ViewAR app initialization process!\n`);

  const user = enteredUser
    ? enteredUser
    : userList.length === 1
    ? userList[0]
    : null;

  if (user) {
    if (enteredUser) {
      console.log(`Logged in as: ${user.name} <${user.email}>`);
    } else {
      console.log(
        `Only one user account found, using this one: ${user.name} <${
          user.email
        }>`
      );
    }
  }

  const answers = await inquirer.prompt([
    {
      name: 'token',
      type: 'list',
      message: 'Select the user account for this app:',
      choices: userList.map(({ name, email }) => `${name} <${email}>`),
      filter: choice =>
        userList.find(({ name, email }) => `${name} <${email}>` === choice)
          .token,
      when: () => !user,
    },
    {
      name: 'type',
      type: 'list',
      message: 'Select a project type:',
      choices: Object.keys(projectTypes),
      filter: value => projectTypes[value],
      when: () => !projectType,
    },
    {
      name: 'sample',
      type: 'list',
      message: 'Select a sample project',
      choices: Object.keys(sampleProjects),
      filter: value => sampleProjects[value],
      when: ({ type }) =>
        projectType === projectTypes['Sample project'] ||
        type === projectTypes['Sample project'],
    },
    {
      name: 'sampleUrl',
      type: 'input',
      message: 'Repository URL',
      when: ({ sample }) => sample === sampleProjects['Other...'],
    },
    {
      name: 'appId',
      type: 'input',
      message: 'Enter the app ID:',
      validate: value => /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+$/.test(value),
    },
    {
      name: 'appVersion',
      type: 'input',
      message: 'Enter the app version:',
      default: '1.0',
      //validate: (value) => /\d+(?:\.\d+(?:\.\d+)?)?/.test(value),
      validate: value => /\d+(?:\.\d+)?/.test(value),
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
          name: 'ARCore',
        },
        {
          name: 'Vuforia',
        },
        {
          name: 'Wikitude',
        },
        {
          name: 'visionLib',
        },
      ],
    },
  ]);

  const {
    token,
    type,
    appId,
    appVersion,
    trackers,
    sample,
    sampleUrl,
  } = Object.assign(
    {
      token: user && user.token,
      type: projectType,
    },
    answers
  );

  const formData = {
    bundleIdentifier: appId,
    version: appVersion,
    token,
    tracker: trackers.join(','),
  };

  console.log(chalk`\nCreating app...`);

  await request.post({ uri: createAppUrl(), formData });

  if (sampleUrl || sample) {
    console.log(chalk`\nChecking out sample project...`);

    const override = overrides['sample/' + (sampleUrl || sample)];

    if (override) {
      shell.cp('-rf', `${override}/*`, '.');
    } else {
      shell.exec(
        `git clone -b master ${sampleUrl || getRepositoryUrl(sample)} .`,
        { silent: true }
      );
    }
  } else {
    console.log(chalk`\nDownloading boilerplate project...`);

    const override = overrides['boilerplate/' + type];

    if (override) {
      shell.cp('-rf', `${override}/*`, '.');
    } else {
      shell.exec(`git clone -b master ${repositoryUrl} temp`, { silent: true });
      shell.mv(`./temp/${type}/*`, `.`);
      shell.rm('-rf', 'temp');
    }
  }

  console.log(chalk`\nInstalling dependencies...`);

  if (shell.exec('npm install', { silent: true }).code !== 0) {
    exitWithError(
      `Failed installing npm dependencies! Check if npm is installed and up-to-date.`
    );
  }

  console.log(chalk`\nInitializing git repository...`);

  if (shell.exec('git init', { silent: true }).code !== 0) {
    exitWithError(
      `Git repository initialization failed! Check if git is installed.`
    );
  }

  updateJson(packageInfoPath, object =>
    Object.assign(object, {
      name: projectName,
      description: '',
    })
  );

  writeJson(cliConfigPath, {
    id: generateToken(),
    token: generateToken(),
    appId,
    appVersion,
  });

  fs.writeFileSync(
    '.gitignore',
    ['.viewar-config', 'node_modules/', 'build/'].join('\n'),
    'utf8'
  );

  await deploy(appId, appVersion, 'initial');

  console.log(
    chalk`\n  App bundle ID: {yellow ${appId}} Version: {yellow ${appVersion}}`
  );
  console.log(
    chalk`\n  Use the {yellow ViewAR SDK app} from App Store/Play Store to test your app on a device.`
  );
  console.log(
    chalk`\n  Visit {yellow https://webversion.viewar.com/${appId}/${appVersion}/} to run your app in the browser.`
  );
  console.log(
    chalk`\n  Run {yellow npm run start} to start the local development server with WebGL support.`
  );
  console.log(
    chalk`\n  Run {yellow npm run start:mock} to start the local development server without WebGL support (mock mode).`
  );
};
