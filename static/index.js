#!/usr/bin/env node

const fsp = require('fs-extra');
const inquirer = require('inquirer');
const convert = require('./converter');

const settingFile = '.awot-static.json';

fsp.readFile(settingFile, { encoding: 'utf8' })
  .then(savedConfig => convert(JSON.parse(savedConfig)))
  .catch((err) => {
    if (err.code !== 'ENOENT') {
      return Promise.reject(err);
    }

    return inquirer.prompt([
      {
        type: 'input',
        name: 'sources',
        message: 'Client source files directory',
        default: './build',
      },
      {
        type: 'input',
        name: 'indexFile',
        message: 'File that is served from the root path of the server',
        default: 'index.html',
      },
      {
        type: 'input',
        name: 'exclude',
        message: 'Exclude files from the build. Separate with commas',
        default: '*.map',
        filter: values => values.split(',').map(value => value.trim()),
      },
      {
        type: 'input',
        name: 'sketchDir',
        message: 'Path to sketch directory',
        default: './arduino/MyApp/',
      },
      {
        type: 'list',
        name: 'createSketch',
        message: 'Generate Arduino sketch file',
        choices: ['Ethernet', 'Wifi', 'No'],
        default: 0,
        filter: value => value.toLowerCase(),
      },
    ]).then(config => convert(config)
      .then(() => {
        const configToSave = config;
        configToSave.createSketch = 'no';
        return fsp.writeFile(settingFile, JSON.stringify(configToSave, null, 2));
      }));
  }).catch(console.log);
