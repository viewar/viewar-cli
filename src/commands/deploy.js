const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const request = require('request-promise');

import exitWithError from '../common/exit-with-error';
import zipDirectory from '../common/zip-dir';
import { readJson, writeJson } from '../common/json';
import {
  getAppConfigUrl,
  getActivateUrl,
  getUploadBundleUrl,
} from '../common/urls';
import { cliConfigPath } from '../common/constants';

export default async (appId, appVersion, tags = '') => {
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

  const appInfo = readJson(
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
    exitWithError('Wrong bundle ID or version!');
  }

  // Check authentication.
  const timestamp = new Date()
    .toISOString()
    .replace(/\..*$/, '')
    .replace(/[-T:]/g, '');

  const ownerId = info.config.channel;
  const data = readJson(cliConfigPath);
  const user = data.users[ownerId];

  if (!user) {
    exitWithError(`App owner is not logged in!`);
  }

  const authResponse = await request
    .post(
      getActivateUrl(user.token, appId, appVersion, `${id}-${timestamp}`, true)
    )
    .then(JSON.parse);

  const { status: authStatus, message: authMessage } = authResponse;

  if (authStatus !== 'ok') {
    exitWithError(authMessage);
  }

  console.log(chalk`\nBundling app...`);

  shell.exec('npm run build', { silent: true });
  if (!fs.existsSync('build')) {
    exitWithError(
      'No build directory existing. Please run yarn build or npm run build manually to check the error message.'
    );
  }

  const corePackageInfo = readJson(
    corePackageInfoPath,
    "'viewar-core' npm dependency not found! Run 'npm install' to install it."
  );
  const apiPackageInfo = readJson(
    apiPackageInfoPath,
    "'viewar-api' npm dependency not found! Run 'npm install' to install it."
  );
  const [commit, author, subject] = shell
    .exec("git log --format='%H||%an <%ae>||%s' HEAD^! | cat", { silent: true })
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

  console.log(chalk`\nUploading app bundle...`);

  const formData = {
    id,
    version: timestamp,
    token,
    file: fs.createReadStream(bundlePath),
  };

  await request.post({ uri: getUploadBundleUrl(), formData });

  shell.rm('-rf', bundlePath);
  shell.rm('-rf', buildDir);

  console.log(chalk`\nActivating bundle...`);

  const response = await request
    .post(getActivateUrl(user.token, appId, appVersion, `${id}-${timestamp}`))
    .then(JSON.parse);

  const { status, message } = response;

  if (status === 'ok') {
    console.log(chalk`\nDone!`);
  } else {
    exitWithError(message);
  }
};
