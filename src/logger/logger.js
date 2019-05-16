import { readJsonSafe } from '../common/json';
import { cliConfigPath } from '../common/constants';
import { getErrorLogUrl } from '../common/urls';
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const createLogger = () => {
  let advancedLogging = false;
  let command = '';
  let args = {};

  const setInfo = (newCommand = '', newArgs = {}) => {
    command = newCommand;
    args = newArgs;
  };

  const logAdvanced = (...args) => {
    if (!advancedLogging) {
      return;
    }

    console.log(...args);
  };

  const logErrorToServer = async message => {
    const viewarConfig = await readJsonSafe(cliConfigPath);
    const body = {
      type: 'Exception',
      note: 'cli',
      app: 'cli',
      data: JSON.stringify({
        message,
        command,
        args,
        viewarConfig,
      }),
    };

    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, value);
    });

    const url = getErrorLogUrl();
    await fetch(url, {
      method: 'post',
      body: params,
    });
  };

  return {
    get advancedLogging() {
      return advancedLogging;
    },
    set advancedLogging(newAdvancedLogging) {
      advancedLogging = newAdvancedLogging;
    },
    setInfo,
    logAdvanced,
    logErrorToServer,
  };
};

export default createLogger();
