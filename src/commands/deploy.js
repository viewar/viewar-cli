const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const request = require('request-promise');
const emojic = require('emojic');

import exitWithError from '../common/exit-with-error';
import zipDirectory from '../common/zip-dir';
import { readJson, writeJson } from '../common/json';
import {
  getAppConfigUrl,
  getActivateUrl,
  getUploadBundleUrl,
} from '../common/urls';
import { cliConfigPath } from '../common/constants';
import logger from '../logger/logger';

export default async (appId, appVersion, tags = '') => {
  logger.setInfo('deploy', {
    appId,
    appVersion,
    tags,
  });

  // Show error if app id is set but no app version.
  if (appId && !appVersion) {
    await exitWithError(
      `Missing app version! Syntax: viewar-cli deploy <appId> <appVersion>`,
      false
    );
  }

  const appRoot = process.cwd();
  const buildDir = path.resolve(appRoot, 'build') + '/';
  const bundlePath = path.resolve(appRoot, 'bundle.zip');
  const appInfoPath = path.resolve(appRoot, '.viewar-config');
  const corePackageInfoPath = path.resolve(
    appRoot,
    'node_modules',
    'viewar-core',
    'package.json'
  );
  const apiPackageInfoPath = path.resolve(
    appRoot,
    'node_modules',
    'viewar-api',
    'package.json'
  );
  const bundleInfoPath = path.resolve(buildDir, 'bundle-info.json');

  const appInfo = await readJson(
    appInfoPath,
    "'.viewar-config' file not found! Working directory does not contain a ViewAR SDK app!"
  );
  const { id, token } = appInfo;

  if (!appId && !appVersion) {
    appId = appInfo.appId;
    appVersion = appInfo.appVersion || appInfo.version;
  }

  if (!appVersion) {
    appVersion = 100;
  }

  const info = await request
    .post(getAppConfigUrl(appId, appVersion))
    .then(JSON.parse);

  if (!info) {
    await exitWithError('Wrong bundle ID or version!');
  }

  // Check authentication.
  const timestamp = new Date()
    .toISOString()
    .replace(/\..*$/, '')
    .replace(/[-T:]/g, '');

  const ownerId = info.config.channel;
  const data = await readJson(cliConfigPath);
  const user = data.users[ownerId];

  if (!user) {
    await exitWithError(`App owner is not logged in!`, false);
  }

  const authResponse = await request
    .post(
      getActivateUrl(user.token, appId, appVersion, `${id}-${timestamp}`, true)
    )
    .then(JSON.parse);

  const { status: authStatus, message: authMessage } = authResponse;

  if (authStatus !== 'ok') {
    await exitWithError(authMessage, false);
  }

  console.log(
    chalk`\n${emojic.informationSource}  Deploying to ${appId} ${appVersion}`
  );

  console.log(chalk`\n${emojic.pointRight}  Bundling app...`);

  shell.exec('npm run build', { silent: !logger.advancedLogging });
  if (!fs.existsSync('build')) {
    await exitWithError(
      'No build directory existing. Please run yarn build or npm run build manually to check the error message.'
    );
  }

  const corePackageInfo = await readJson(
    corePackageInfoPath,
    "'viewar-core' npm dependency not found! Run 'npm install' to install it."
  );
  const apiPackageInfo = await readJson(
    apiPackageInfoPath,
    "'viewar-api' npm dependency not found! Run 'npm install' to install it."
  );
  const [commit, author, subject] = shell
    .exec("git log --format='%H||%an <%ae>||%s' HEAD^! | cat", {
      silent: !logger.advancedLogging,
    })
    .stdout.trim()
    .split('||');

  writeJson(bundleInfoPath, {
    tags: tags ? tags.split(',') : [],
    apiVersion: apiPackageInfo['version'],
    coreVersion: corePackageInfo['version'],
    git: {
      commit,
      author,
      message: subject,
    },
  });

  await zipDirectory(buildDir, bundlePath);

  console.log(chalk`\n${emojic.pointRight}  Uploading app bundle...`);

  const formData = {
    id,
    version: timestamp,
    token,
    file: fs.createReadStream(bundlePath),
  };

  await request.post({ uri: getUploadBundleUrl(), formData });

  shell.rm('-rf', bundlePath);
  shell.rm('-rf', buildDir);

  console.log(chalk`\n${emojic.pointRight}  Activating bundle...`);

  const response = await request
    .post(getActivateUrl(user.token, appId, appVersion, `${id}-${timestamp}`))
    .then(JSON.parse);

  const { status, message } = response;

  if (status === 'ok') {
    console.log(chalk`\n${emojic.whiteCheckMark}  {green Done!}`);
  } else {
    await exitWithError(message);
  }
};
