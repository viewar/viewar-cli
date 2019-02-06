const getLoginUrl = (username, passwordHash) =>
  `http://dev2.viewar.com/api40/getUserToken/user:${username}/password:${passwordHash}`;
const getListAppsUrl = (userId, token) =>
  `http://dev2.viewar.com/api40/listapps/userId:${userId}/token:${token}`;
const getActivateUrl = (token, appId, version, appToken, dryRun = false) =>
  `http://dev2.viewar.com/api40/activateAppfilesUpload/token:${token}/bundleIdentifier:${appId}/version:${version}/appFiles:${appToken}/dryRun:${dryRun}`;
const getUploadBundleUrl = () => `http://dev2.viewar.com/api40/appfilesUpload`;
const getAppConfigUrl = (appId, version) =>
  `http://api.viewar.com/api20/configuration/bundleidentifier:${appId}/version:${version}`;
const createAppUrl = () => `https://dev2.viewar.com/api40/createApp`;

const getRepositoryUrl = templateName =>
  `https://github.com/viewar/viewar-template-${templateName}.git`;

const getBoilerplateRepositoryUrl = name =>
  `https://github.com/viewar/viewar-boilerplate-${name}.git`;

const getCliConfigUrl = (templateName, branch = 'master') =>
  `https://raw.githubusercontent.com/viewar/viewar-template-${templateName}/${branch}/.viewar-template-config.json`;

module.exports = {
  createAppUrl,
  getActivateUrl,
  getAppConfigUrl,
  getListAppsUrl,
  getLoginUrl,
  getRepositoryUrl,
  getBoilerplateRepositoryUrl,
  getCliConfigUrl,
  getUploadBundleUrl,
};
