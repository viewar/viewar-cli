const { getUploadBundleUrl } = require('../common/urls')

module.exports = ({request}) => async (fileStream, id, version, token) => {
  const formData = {
    id,
    version,
    token,
    file: fileStream,
  }

  return request.post({uri: getUploadBundleUrl(), formData})
}
