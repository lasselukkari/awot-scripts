aWOT-scripts
============
## Installation
```bash
$ npm install awot-scripts -g
```
# Scripts
## awot-static
Converts files to static gzipped payloads compatible with the aWOT web server library.
### Example usage: React app
Preconditions: Latest [Arduino IDE](https://www.arduino.cc/en/Main/Software) is installed along with [aWOT library](https://github.com/lasselukkari/aWOT)  

1. Install create-react-app and awot-scripts
```bash
npm install -g create-react-app
npm install -g awot-scripts
```
2. Create a new project with create-react-app and build the project.
```bash
create-react-app my-app
cd my-app/
npm run build
```

3. Run the awot-static script.
```bash
awot-static
```

4. Answer questions made by the script. Config will be stored to .awot-static.json for next run.
```bash
? Client source files directory: ./build
? File that is served from the root path of the server: index.html
? Exclude files from the build. Separate with commas: *.map
? Path to sketch directory: ./arduino/MyApp
? Generate Arduino sketch file: Wifi
```
5. Open generated sketch with Arduino IDE and upload to device.
6. Repeat steps 3. and 5. when source files are updated.
