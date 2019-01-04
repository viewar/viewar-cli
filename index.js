#!/usr/bin/env node

/**
 * Viewar CLI
 *
 * Install locally with npm link.
 */
const checkNodeVersion = require('./common/check-node-version');
checkNodeVersion();

require('./cli');
