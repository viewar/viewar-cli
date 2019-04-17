const crypto = require('crypto');
const hash = crypto.createHash('md5');
const inquirer = require('inquirer');
const request = require('request-promise');

import exitWithError from '../common/exit-with-error';
import { updateJson } from '../common/json';
import { cliConfigPath } from '../common/constants';
import { getLoginUrl } from '../common/urls';

export default async userEmail => {
  const validateEmail = value => /.+@.+\..+/.test(value);

  console.log('Log in with your ViewAR account.');
  console.log(
    `If you don't have an account, create one at developer.viewar.com.`
  );
  const { email = userEmail, password } = await inquirer.prompt([
    {
      type: 'input',
      message: 'Enter email:',
      name: 'email',
      validate: validateEmail,
      when: () => !validateEmail(userEmail),
    },
    {
      type: 'password',
      message: 'Enter password:',
      name: 'password',
    },
  ]);

  const passwordHash = hash.update(password).digest('hex');

  const response = await request
    .post(getLoginUrl(email, passwordHash))
    .then(JSON.parse);

  const { status, userId, fullname: userName, token } = response;

  if (status === 'ok') {
    updateJson(cliConfigPath, config => {
      config.users = config.users || {};
      config.users[userId] = {
        id: userId,
        name: userName,
        email: email,
        token,
      };

      return config;
    });
    console.log(`User ${userName} <${email}> logged in.`);
  } else {
    exitWithError(`Authentication failed! (${response.error})`);
  }
};
