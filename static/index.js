#!/usr/bin/env node

const pkgConf = require('pkg-conf');
const convert = require('./converter');

const packageConfig = pkgConf.sync('awot-static');

if (packageConfig.sources && packageConfig.indexFile && packageConfig.sketchDir) {
  convert(packageConfig).catch(console.error);
} else {
  console.error(new Error('No config found'));
}
