export const getLoginUrl = (username, passwordHash) =>
  `http://dev2.viewar.com/api40/getUserToken/user:${username}/password:${passwordHash}`;

export const getListAppsUrl = (userId, token) =>
  `http://dev2.viewar.com/api40/listapps/userId:${userId}/token:${token}`;

export const getActivateUrl = (
  token,
  appId,
  version,
  appToken,
  force = false,
  dryRun = false
) =>
  `http://dev2.viewar.com/api40/activateAppfilesUpload/token:${token}/bundleIdentifier:${appId}/version:${version}/appFiles:${appToken}/dryRun:${dryRun}/supportsForce:${true}/force:${force}`;

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

export const getSampleConfigUrl = url => {
  if (url && url.startsWith('https://github.com')) {
    /**
     * Just valid for github.com urls.
     *
     * Replace:
     * - '.git' ending
     * - 'github.com' with 'raw.githubusercontent.com'
     *
     * Add:
     * - '/master' branch
     * - '.viewar-template-config.json'
     *
     * So basically it outputs 'https://raw.githubusercontent.com/viewar/viewar-boilerplate-joystick-react/master/.viewar-template-config.json' if 'https://github.com/viewar/viewar-boilerplate-joystick-react.git' is given as url input.
     */
    return (
      url
        .replace(/\.git$/, '')
        .replace('github.com', 'raw.githubusercontent.com') +
      '/master/.viewar-template-config.json'
    );
  }

  return false;
};

export const getErrorLogUrl = () => `http://api.viewar.com/api30/log/`;
