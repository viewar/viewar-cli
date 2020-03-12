let path = require('path');
const util = require('util');
let exec = util.promisify(require('child_process').exec);
let spawn = require('child_process').spawn;

jest.setTimeout(30000);

async function cli(args, cwd) {
  const result = await exec(
    `node ${path.resolve('./dist/index.js')} ${args.join(' ')}`,
    { cwd }
  );
  // remove process.argv print
  result.stdout = result.stdout.split(/\n/);
  result.stdout.pop();
  result.stdout = result.stdout.pop();

  return result;
}

describe('[parameters]', () => {
  test('--version', async () => {
    let result = await cli(['--version'], '.');

    expect(result.stderr).toBe('');
    expect(/^\d+\.\d+\.\d+/i.test(result.stdout)).toBe(true);
  });

  test('--help', async () => {
    let result = await cli(['--help'], '.');
    expect(result.stderr).toBe('');
  });
});

describe('[commands]', () => {
  test('whoami', async () => {
    let result = await cli(['whoami'], '.');

    expect(result.stderr).toBe('');
    expect(typeof result.stdout).toBe('string');
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  // TODO: login as test-user and check whoami
  // test('login', async () => {
  //   let result = await cli(['whoami'], '.');
  //   expect(result.stderr).toBe('');
  // });
});
