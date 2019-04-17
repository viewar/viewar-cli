import '@babel/polyfill';
import cli from './src/cli';

/**
 * Viewar CLI
 */
import checkNodeVersion from './src/common/check-node-version';
checkNodeVersion().then(() => {
  cli();
});
