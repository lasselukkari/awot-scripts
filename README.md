awot-scripts [![Build Status](https://travis-ci.org/lasselukkari/awot-scripts.svg?branch=master)](https://travis-ci.org/lasselukkari/awot-scripts) [![npm version](http://img.shields.io/npm/v/awot-scripts.svg?style=flat)](https://npmjs.org/package/awot-scripts "View this project on npm")
============
## Installation
```bash
$ npm install awot-scripts
```

# Scripts
## awot-static
Creates gzip compressed payload files for [aWOT web server](https://github.com/lasselukkari/aWOT).

Add config to the root level of `package.json` and `awot-static` script to the `scripts`.

### Example config
```json
{
  "awot-static": {
   "sources": "./build",
    "indexFile": "index.html",
    "sketchDir": "./ArduinoProject",
    "exclude": [
      "*.map",
      "service-worker.js"
    ]
  },
  "scripts": {
    "awot-static": "awot-static"
  }
}
```

Execute the script by running `npm run awot-static`.

This will generate a static gzipped payload file `StaticFiles.h` to the `sketchDir` directory. Include the file with `#include "StaticFiles.h"` and to mount the http handlers call `app.use(staticFiles());`.

## awot-create
Creates a boilerplate Arduino project for the [aWOT web server](https://github.com/lasselukkari/aWOT) library.

Execute the script by running `npx run awot-create ProjectName Wifi|Ethernet`. Defaults to Wifi.

## awot-commmand-line
Control Arduino IDE command line interface using config defined in `package.json` file.

Add config to the root level of `package.json` and `awot-command-line` script to the `scripts`.

### Example config
```json
{
 "awot-command-line": {
    "sketch": "SketchName/SketchName.ino",
    "idePath": "/Applications/Arduino.app/Contents/MacOS/arduino",
    "port": "/dev/cu.Repleo-PL2303-00002014",
    "board": {
      "package": "esp32",
      "arch": "esp32",
      "board": "esp32"
    },
    "action": "upload"
  },
  "scripts": {
    "awot-command-line": "awot-command-line"
  }
}
```

Execute the script by running `npm run awot-command-line`.

The options can also be extended:
```json
{
  "awot-command-line": {
    "sketch": "DuinoDCX/DuinoDCX.ino",
    "idePath": "/Applications/Arduino.app/Contents/MacOS/arduino",
    "port": "/dev/cu.Repleo-PL2303-00002014",
    "board": {
      "package": "esp32",
      "arch": "esp32",
      "board": "esp32"
    },
    "extensions": {
      "upload": {
        "action": "upload"
      },
      "verify": {
        "action": "verify"
      }
    }
  },
  "scripts": {
     "upload": "awot-command-line upload",
     "verify": "awot-command-line verify"
  }
}
```

Execute the scripts by running `npm run upload` and `npm run verify`.

### Options
Options are defined in the `package.json` file under the `awot-command-line` key.

#### idePath
Type: `String`
Default value: `'/Applications/Arduino.app/Contents/MacOS/arduino'`

Path to Arduino IDE executable file.

#### sketch
Type: `String`

Path to the sketch file.

#### action
Type: `String`

Defines the performed action.
##### Available actions

###### verify
Builds the sketch.

###### upload
Builds and uploads the sketch.

###### getPref
Prints the value of the given preference to the standard output stream. When the value does not exist, nothing is printed and the exit status is set (see EXIT STATUS below). If no preference is given as parameter, it prints all preferences. Used with `board` parameter

###### installBoards
Fetches available board support (platform) list and install the specified one, along with its related tools. If version is omitted, the latest is installed. If a platform with the same version is already installed, nothing is installed and program exits with exit code 1. If a platform with a different version is already installed, it’s replaced. Used with `board` parameter

###### installLibrary
Fetches available libraries list and install the specified one. If version is omitted, the latest is installed. If a library with the same version is already installed, nothing is installed and program exits with exit code 1. If a library with a different version is already installed, it’s replaced. Used with `libraries` parameter.

#### libraries
Type: `[{name: String, version: String}]`
An array of libraries to install. Parameter `version` is optional.

#### board.package
Type: `String`

Package is the identifier of the vendor (the first level folders inside the hardware directory). Default arduino boards use `arduino`.

#### board.arch
Type: `String`

Architecture is the architecture of the board (second level folders inside the hardware directory). Default arduino boards use either `avr` for all AVR-based boards (like Uno, Mega or Leonardo) or ´sam´ for 32bit SAM-based boards (like Arduino Due).

#### board.board
Type: `String`

Board is the actual board to use, as defined in boards.txt contained in the architecture folder selected. For example, `uno` for the Arduino Uno, `diecimila` for the Arduino Duemilanove or Diecimila, or ´mega´ for the Arduino Mega.

#### preference
Type: `String`

Used with ´getPref´ action;

#### parameters
Type: `String`
Parameters is a comma-separated list of boards specific parameters that are normally shown under submenus of the "Tools" menu. For example 'cpu=atmega168' to Select the mega168 variant of the Arduino Nano board.

#### verboseBuild
Type: `Boolean`
Default value: `false`

Enable verbose mode during build. If this option is not given, verbose mode during build is disabled regardless of the current preferences.

#### verboseUpload
Type: `Boolean`
Default value: `false`

Enable verbose mode during upload. If this option is not given, verbose mode during upload is disabled regardless of the current preferences.

This option is only valid together with actions 'verify' or 'upload'.

#### verbose
Type: `Boolean`
Default value: `false`

Enable verbose mode during build and upload. This option has the same effect of using both verboseBuild and --verboseUpload.

#### preserveTempFiles
Type: `Boolean`
Default value: `false`

Keep temporary files (preprocessed sketch, object files…) after termination. If omitted, temporary files are deleted.

This option is only valid together with actions `verify´ or `upload`.

#### preferencesFile
Type: `Boolean`
Default value: `false`

Read and store preferences from the specified filename instead of the default one.

#### savePrefs
Type: `Boolean`
Default value: `false`

Save any (changed) preferences to preferences.txt. In particular --board, --port, --pref, --verbose, --verbose-build and --verbose-upload may alter the current preferences.
