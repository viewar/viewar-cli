let path = require('path');
let exec = require('child_process').exec;

function cli(args, cwd) {
  return new Promise(resolve => {
    exec(
      `node ${path.resolve('./dist/index.js')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

describe('[parameters]', () => {
  test('--version', async () => {
    let result = await cli(['--version'], '.');
    expect(/^\d+\.\d+\.\d+/i.test(result.stdout)).toBe(true);
  });
  test('--help', async () => {
    let result = await cli(['--help'], '.');
    expect(result.code).toBe(0);
  });
});
