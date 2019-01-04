const request = require('request-promise');
const { getCliConfigUrl } = require('./urls');

module.exports = async sample => {
  if (sample) {
    const url = getCliConfigUrl(sample);
    try {
      const data = await request.get(url);

      return JSON.parse(data || '{}');
    } catch (e) {
      return {};
    }
  } else {
    return {};
  }
};
