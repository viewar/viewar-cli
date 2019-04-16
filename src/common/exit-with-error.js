import chalk from 'chalk';

export default (message, errorCode = 1) => {
  console.error(chalk`{red ERROR: ${message}}`);
  process.exit(errorCode);
};
