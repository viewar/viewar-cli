export const getLoginUrl = (username, passwordHash) =>
  `http://dev2.viewar.com/api40/getUserToken/user:${username}/password:${passwordHash}`;

export const getListAppsUrl = (userId, token) =>
  `http://dev2.viewar.com/api40/listapps/userId:${userId}/token:${token}`;

export const getActivateUrl = (
  token,
  appId,
  version,
  appToken,
  dryRun = false
) =>
  `http://dev2.viewar.com/api40/activateAppfilesUpload/token:${token}/bundleIdentifier:${appId}/version:${version}/appFiles:${appToken}/dryRun:${dryRun}`;

export const getUploadBundleUrl = () =>
  `http://dev2.viewar.com/api40/appfilesUpload`;

export const getAppConfigUrl = (appId, version) =>
  `http://api.viewar.com/api20/configuration/bundleidentifier:${appId}/version:${version}`;

export const createAppUrl = () => `https://dev2.viewar.com/api40/createApp`;

export const getRepositoryUrl = templateName =>
  `https://github.com/viewar/viewar-template-${templateName}.git`;

export const getBoilerplateRepositoryUrl = name =>
  `https://github.com/viewar/viewar-boilerplate-${name}.git`;

export const getCliConfigUrl = (templateName, branch = 'master') =>
  `https://raw.githubusercontent.com/viewar/viewar-template-${templateName}/${branch}/.viewar-template-config.json`;

export const getErrorLogUrl = () => `http://api.viewar.com/api30/log/`;
