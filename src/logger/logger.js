import { readJsonSafe } from '../common/read-json-safe';
import { cliConfigPath } from '../common/constants';
import { getErrorLogUrl } from '../common/urls';
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const emojic = require('emojic');
const chalk = require('chalk');

const createLogger = () => {
  let advancedLogging = false;
  let serverLogging = false;
  let command = '';
  let args = {};

  const setInfo = (newCommand = '', newArgs = {}) => {
    command = newCommand;
    args = newArgs;
  };

  const logError = (message, showAdvancedHint = true) => {
    console.error(chalk`{red ${emojic.x}  ${message}}`);
    if (showAdvancedHint && !advancedLogging) {
      console.log(
        chalk`{yellow ${emojic.warning}  Run with -l for advanced log output.}`
      );
    }
  };

  /**
   * Logs errors to ViewAR server. Only enabled if flag '--server' or '-s' is set.
   */
  const logErrorToServer = async message => {
    if (!serverLogging) {
      return;
    }

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
    set serverLogging(newServerLogging) {
      serverLogging = newServerLogging;
    },
    setInfo,
    logError,
    logErrorToServer,
  };
};

export default createLogger();
