aWOT-scripts
============
## Installation
```bash
$ npm install awot-scripts
```

# Scripts
## awot-static
Add config to the root level of `package.json` and `awot-static` script to the `scripts`.

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

This will generate a static gzipped payload file `StaticFiles.h` to the `sketchDir` directory. Import this file to your main sketch file with `#include "StaticFiles.h"`. To mount the http handlers call `ServeStatic(&app);`.
