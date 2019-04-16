import '@babel/polyfill';

/**
 * Viewar CLI
 */
import checkNodeVersion from './src/common/check-node-version';
checkNodeVersion();

import './src/cli';
