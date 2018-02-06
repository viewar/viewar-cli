const getLoginUrl = (username, passwordHash) => `http://dev2.viewar.com/api40/getUserToken/user:${username}/password:${passwordHash}`
const getListAppsUrl = (userId, token) => `http://dev2.viewar.com/api40/listapps/userId:${userId}/token:${token}`
const getActivateUrl = (token, appId, version, appToken) => `http://dev2.viewar.com/api40/activateAppfilesUpload/token:${token}/bundleIdentifier:${appId}/version:${version}/appFiles:${appToken}`
const getUploadBundleUrl = () => `http://dev2.viewar.com/resources/AppfilesUpload`
const getAppConfigUrl = (appId, version) => `http://api.viewar.com/api20/configuration/bundleidentifier:${appId}/version:${version}`

module.exports = {
  getActivateUrl,
  getAppConfigUrl,
  getListAppsUrl,
  getLoginUrl,
  getUploadBundleUrl,
}
