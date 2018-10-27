#!/usr/bin/env node

const pkgConf = require('pkg-conf');
const convert = require('./converter');

const packageConfig = pkgConf.sync('awot-static');

if (packageConfig.sources && packageConfig.indexFile && packageConfig.sketchDir) {
  convert(packageConfig).catch(console.error); // eslint-disable-line no-console
} else {
  console.error('No config found'); // eslint-disable-line no-console
}
