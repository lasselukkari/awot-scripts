#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const pkgConf = require('pkg-conf');

const defaults = { idePath: '/Applications/Arduino.app/Contents/MacOS/arduino' };
const pkgOptions = pkgConf.sync('awot-command-line');
const { extensions = {} } = pkgOptions;
const extensionName = process.argv[2];
let extension = extensions[extensionName];

if (extensionName && !extension) {
  throw new Error(`Extensions ${extensionName} not found`);
} else if (!extensionName) {
  extension = {};
}

const options = Object.assign(defaults, pkgOptions, extension);
const {
  action,
  board,
  preferencesFile,
  port,
  verbose,
  verboseBuild,
  verboseUpload,
  preference,
  sketch,
  libraries,
  savePrefs,
  preserveTempFiles,
  idePath,
} = options;
const args = [];

if (action) {
  args.push(`--${action}`);
}

if (preferencesFile) {
  args.push('--preferences-file', preferencesFile);
} else {
  if (board) {
    if (!board.package || !board.arch || !board.board) {
      throw (new Error('One or more board parameters are missing'));
    } else {
      const boardParams = [board.package, board.arch];

      if (action === 'installBoards') {
        if (board.version) {
          boardParams.push(board.version);
        }
        args.push('--install-boards', board.join(':'));
      } else {
        boardParams.push(board.board);
        if (board.parameters) {
          boardParams.push(board.parameters);
        }
        args.push('--board', boardParams.join(':'));
      }
    }
  }

  if (port) {
    args.push('--port', port);
  }

  if (verbose) {
    args.push('--v');
  } else {
    if (verboseBuild) {
      args.push('--verbose-build');
    }

    if (verboseUpload) {
      args.push('--verbose-upload');
    }
  }

  if (preserveTempFiles) {
    args.push('--preserve-temp-files');
  }

  if (savePrefs) {
    args.push('--save-prefs');
  }
}

if (action === 'upload' || action === 'verify') {
  if (!sketch) {
    throw (new Error('Sketch option is missing'));
  } else if (!fs.existsSync(sketch)) {
    throw (new Error('Sketch file not found'));
  }

  args.push(path.resolve(sketch));
} else if (action === 'getPref') {
  if (preference) {
    args.push(preference);
  }
} else if (action === 'installLibrary') {
  if (libraries.length > 0) {
    const installParams = [];

    libraries.forEach((library) => {
      if (!library.name) {
        throw (new Error('Library name missing'));
      }

      const libraryParams = [];
      libraryParams.push(library.name);
      if (library.version) {
        libraryParams.push(library.version);
      }

      installParams.push(library.join(':'));
    });

    args.push('--install-library', installParams.join(','));
  }
}

const ideProcess = spawn(idePath, args);
ideProcess.stdout.pipe(process.stdout);
ideProcess.stderr.pipe(process.stderr);
process.on('exit', () => ideProcess.kill());
