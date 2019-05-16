const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const inquirer = require('inquirer');
const request = require('request-promise');
import login from './login';

import getTemplateConfig from '../common/get-template-config';
import exitWithError from '../common/exit-with-error';
import generateToken from '../common/generate-token';
import { readJson, updateJson, writeJson } from '../common/json';
import {
  createAppUrl,
  getRepositoryUrl,
  getBoilerplateRepositoryUrl,
} from '../common/urls';
import {
  cliConfigPath,
  projectTypes,
  sampleProjects,
} from '../common/constants';
import deploy from '../commands/deploy';
import logger from '../logger/logger';

async function getUserList() {
  const { users = {} } = await readJson(cliConfigPath);
  return Object.values(users);
}

export default async (directory, projectType, userEmail) => {
  logger.setInfo('init', {
    directory,
    projectType,
    userEmail,
  });

  if (!shell.which('git')) {
    await exitWithError(
      'You need to install git first to initialize a new project!'
    );
  }

  let projectDir = path.resolve(process.cwd());
  if (directory) {
    projectDir += `/${directory}`;
    shell.mkdir('-p', projectDir);
  }

  const packageInfoPath = path.resolve(projectDir, 'package.json');
  const configPath = path.resolve(projectDir, '.viewar-config');
  const dirEmpty = shell.ls(projectDir).length === 0;

  if (!dirEmpty) {
    await exitWithError('Directory not empty!');
  }

  shell.cd(projectDir);

  const projectName = directory
    ? directory.split('/').pop()
    : process
        .cwd()
        .split(path.sep)
        .pop();

  const { overrides = {} } = await readJson(cliConfigPath);

  let userList = await getUserList();

  if (userList.length === 0) {
    await login();
    userList = await getUserList();
  }

  const enteredUser =
    userEmail && userList.find(user => user.email === userEmail);

  if (userEmail && !enteredUser) {
    await exitWithError(
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

  // Get new app info.
  const answers = await inquirer.prompt([
    {
      name: 'token',
      type: 'list',
      message: 'Select the user account for this app:',
      choices: userList
        .sort((a, b) => {
          // Sort by name (A-Z).
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();

          return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
        })
        .map(({ name, email }) => `${name} <${email}>`),
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
      message: 'Select a template project',
      choices: Object.keys(sampleProjects),
      filter: value => sampleProjects[value],
      when: ({ type }) => type === 'sample', // Adapt this if you change sample project type name in constants.js.
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
  ]);

  let { token, type, appId, appVersion, sample, sampleUrl } = Object.assign(
    {
      token: user && user.token,
      type: projectType,
    },
    answers
  );

  // Get template config.
  let templateConfig = await getTemplateConfig(sample);

  // Get tracking config (if existing in template config) or tracker.
  let trackingAnswer;
  if (templateConfig.tracking) {
    if (Object.keys(templateConfig.tracking).length === 1) {
      // Automatically select tracker if only one given in template config.
      trackingAnswer = {
        trackingConfig: Object.keys(templateConfig.tracking)[0],
      };
    } else {
      trackingAnswer = await inquirer.prompt([
        {
          name: 'trackingConfig',
          type: 'list',
          message: 'Choose tracking config:',
          choices: Object.keys(templateConfig.tracking),
        },
      ]);
    }
  } else {
    trackingAnswer = await inquirer.prompt([
      {
        name: 'trackers',
        type: 'checkbox',
        message: 'Choose trackers:',
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
          {
            name: 'Placenote',
          },
          {
            name: 'Remote',
          },
        ],
      },
    ]);
  }

  const { trackers = [], trackingConfig = null } = trackingAnswer;

  const formData = {
    bundleIdentifier: appId,
    version: appVersion,
    token,
    tracker: trackers.join(','),
  };

  if (trackingConfig) {
    // This will override tracker if existing.
    formData.trackingConfig = JSON.stringify(
      templateConfig.tracking[trackingConfig]
    );
  }

  const createApp = async () => {
    try {
      const resultJSON = await request.post({ uri: createAppUrl(), formData });
      const result = JSON.parse(resultJSON);
      if (result.status === 'error') {
        if (result.error === 1) {
          // Error code 1: App already existing. Inquire for new app id and version.
          console.log(
            chalk`{red App ID ${appId} with version ${appVersion} already existing, please choose another app ID.}`
          );
          const answer = await inquirer.prompt([
            {
              name: 'appId',
              message: 'Enter the app ID:',
              type: 'input',
              validate: value =>
                /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+$/.test(value),
            },
            {
              name: 'appVersion',
              type: 'input',
              message: 'Enter the app version:',
              default: '1.0',
              validate: value => /\d+(?:\.\d+)?/.test(value),
            },
          ]);
          appId = answer.appId;
          appVersion = answer.appVersion;
          Object.assign(formData, {
            bundleIdentifier: appId,
            version: appVersion,
          });
          formData.bundleIdentifier = appId;
          await createApp();
        } else {
          await exitWithError(`${result.message}`);
        }
      }
    } catch (e) {
      await exitWithError(
        `Unknown error while creating app on server: ${e.message}`
      );
    }
  };

  console.log(chalk`\nCreating app...`);
  await createApp();

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
      shell.exec(`git clone -b master ${getBoilerplateRepositoryUrl(type)} .`, {
        silent: true,
      });
    }
  }

  writeJson(configPath, {
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

  console.log(chalk`\nInstalling dependencies...`);

  if (shell.exec('npm install', { silent: true }).code !== 0) {
    await exitWithError(
      `Failed installing npm dependencies! Check if npm is installed and up-to-date. Then manually run 'npm install'.`
    );
  }

  console.log(chalk`\nInitializing git repository...`);

  if (shell.exec('git init', { silent: true }).code !== 0) {
    await exitWithError(
      `Git repository initialization failed! Check if git is installed.`
    );
  }

  updateJson(packageInfoPath, object =>
    Object.assign(object, {
      name: projectName,
      description: '',
    })
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
