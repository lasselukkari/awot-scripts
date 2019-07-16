#!/usr/bin/env node

const fs = require('fs-extra');

const path = require('path');
const https = require('https');

const projectName = process.argv[2];
const library = process.argv[3] || 'Wifi';

const awotRoot = 'https://raw.githubusercontent.com/lasselukkari/aWOT/master/src/';
const cppFileName = 'aWOT.cpp';
const hFileName = 'aWOT.h';

const projectDir = path.join(process.cwd(), projectName, '/');
const templateSketch = path.join(__dirname, 'files', `${library}.ino`);
const templateFiles = path.join(__dirname, 'files', 'StaticFiles.h');
const projectSketch = path.join(projectDir, `${projectName}.ino`);
const projectFiles = path.join(projectDir, 'StaticFiles.h');
const cppfile = path.join(projectDir, cppFileName);
const hfile = path.join(projectDir, hFileName);

if (fs.existsSync(projectDir)) {
  console.error(new Error(`Directory with the name ${projectName} already exists.`));
} else if (!fs.existsSync(templateSketch)) {
  console.error(new Error(`Library option ${library} does not exist.`));
} else {
  fs.mkdirSync(projectDir);
  fs.copy(templateFiles, projectFiles).catch(console.error);
  fs.copy(templateSketch, projectSketch).catch(console.error);

  const cppStream = fs.createWriteStream(cppfile);
  const headerStream = fs.createWriteStream(hfile);

  const cppRequest = https.request(awotRoot + cppFileName, (res) => {
    res.on('error', console.error);
    res.pipe(cppStream);
  }).end();

  const headerRequest = https.request(awotRoot + hFileName, (res) => {
    res.on('error', console.error);
    res.pipe(headerStream);
  }).end();

  [cppStream, headerStream, cppRequest, headerRequest]
    .forEach(emitter => emitter.on('error', console.error));
}
