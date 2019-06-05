const request = require('request-promise');

export default async url => {
  if (url) {
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
