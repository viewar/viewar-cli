const request = require('request-promise');
import { getCliConfigUrl } from './urls';

export default async sample => {
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
