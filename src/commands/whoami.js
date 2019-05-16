import { cliConfigPath } from '../common/constants';
import { readJson } from '../common/json';

export default async () => {
  logger.setInfo('whoami');

  const data = await readJson(cliConfigPath);
  console.log(
    Object.values(data.users)
      .map(user => `${user.name} <${user.email}>`)
      .join('\n')
  );
};
