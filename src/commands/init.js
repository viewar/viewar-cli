const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const inquirer = require('inquirer');
const request = require('request-promise');
const emojic = require('emojic');

import login from './login';
import getTemplateConfig from '../common/get-template-config';
import exitWithError from '../common/exit-with-error';
import generateToken from '../common/generate-token';
import { readJson, updateJson, writeJson } from '../common/json';
import {
  createAppUrl,
  getRepositoryUrl,
  getBoilerplateRepositoryUrl,
  getCliConfigUrl,
  getSampleConfigUrl,
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
      'To initialize a new project, you need to have git installed!'
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
    await exitWithError(
      `Directory '${projectDir}' is not empty! Please choose a different one.`,
      false
    );
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
      `User with email ${userEmail} is not logged in!  Run viewar-cli whoami to see a list of logged in users or run viewar-cli login to login as a different user.`
    );
  }

  console.log(
    chalk`\n ${
      emojic.wave
    }  Welcome to the ViewAR App initialization process!\n`
  );

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
        `Only one user account found. Using: ${user.name} <${user.email}>`
      );
    }
  }

  // Get new app info.
  const answers = await inquirer.prompt(
    [
      {
        name: 'token',
        type: 'list',
        message:
          'Select the User Account for this App. Navigate through the list with the up/down arrow keys.',
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
        message: 'Enter the App ID:',
        validate: value => {
          const success = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+$/.test(value);
          if (success) {
            return true;
          }
          return 'Use the characters a-z, A-Z, 0-9 and . as a separator';
        },
      },
      {
        name: 'appVersion',
        type: 'input',
        message: 'Enter the App version:',
        default: '1.0',
        //validate: (value) => /\d+(?:\.\d+(?:\.\d+)?)?/.test(value),
        validate: value => {
          const success = /^\d+(?:\.\d+)+$/.test(value);
          if (success) {
            return true;
          }
          return 'Use the characters 0-9 and . as a separator';
        },
      },
    ],
    answers => {
      console.log(answers);
    }
  );

  let {
    token,
    type,
    appId,
    appVersion,
    sample,
    sampleUrl = '',
  } = Object.assign(
    {
      token: user && user.token,
      type: projectType,
    },
    answers
  );

  // Remove zero-width space characters (e.g. when copy-pasted from a pdf).
  const sanitizedSampleUrl = sampleUrl.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Get template config.
  let templateConfig = await getTemplateConfig(
    getSampleConfigUrl(sanitizedSampleUrl) || getCliConfigUrl(sample)
  );

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
        message:
          'Choose one or multiple tracking systems to be used by the App. Navigate through the list with the up/down arrow keys and toggle the options on/off with the space key.',
        choices: [
          {
            name: 'ARKit',
          },
          {
            name: 'ARCore',
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
            chalk`{red App ID ${appId} with version ${appVersion} already existing, please choose another app ID or version.}`
          );
          const answer = await inquirer.prompt([
            {
              name: 'appId',
              message: 'Enter the app ID:',
              type: 'input',
              validate: value => {
                const success = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+$/.test(value);
                if (success) {
                  return true;
                }
                return 'Use the characters a-z, A-Z, 0-9 and . as separator';
              },
            },
            {
              name: 'appVersion',
              type: 'input',
              message: 'Enter the app version:',
              default: '1.0',
              validate: value => {
                const success = /^\d+(?:\.\d+)+$/.test(value);
                if (success) {
                  return true;
                }
                return 'Use the characters 0-9 and . as separator';
              },
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

  console.log(chalk`\n${emojic.pointRight}  Creating app...`);
  await createApp();

  if (sampleUrl || sample) {
    console.log(chalk`\n${emojic.pointRight}  Checking out sample project...`);

    const override = overrides['sample/' + (sanitizedSampleUrl || sample)];

    if (override) {
      shell.cp('-rf', `${override}/*`, '.');
    } else {
      shell.exec(
        `git clone -b master ${sanitizedSampleUrl ||
          getRepositoryUrl(sample)} .`,
        { silent: !logger.advancedLogging }
      );
    }
  } else {
    console.log(
      chalk`\n${emojic.pointRight}  Downloading boilerplate project...`
    );

    const override = overrides['boilerplate/' + type];

    if (override) {
      shell.cp('-rf', `${override}/*`, '.');
    } else {
      shell.exec(`git clone -b master ${getBoilerplateRepositoryUrl(type)} .`, {
        silent: !logger.advancedLogging,
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

  console.log(chalk`\n${emojic.pointRight}  Installing dependencies...`);

  if (
    shell.exec('npm install', { silent: !logger.advancedLogging }).code !== 0
  ) {
    await exitWithError(
      `Failed installing npm dependencies! Check if npm is installed and up-to-date. Then manually run 'npm install'.`
    );
  }

  console.log(chalk`\n${emojic.pointRight}  Initializing git repository...`);

  if (shell.exec('git init', { silent: !logger.advancedLogging }).code !== 0) {
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
