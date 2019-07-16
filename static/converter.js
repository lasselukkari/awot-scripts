const path = require('path');
const zlib = require('zlib');

const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const mime = require('mime-types');
const recursive = require('recursive-readdir');

const runDate = new Date();

function toHexPayload(data) {
  return data
    .toString('hex')
    .match(/.{1,2}/g)
    .map(hex => ` 0x${hex}`)
    .toString()
    .match(/.{1,72}/g)
    .map(line => `${line}\n`)
    .join('   ');
}

function makeChunks(buffer, chunkSize) {
  const result = [];
  const len = buffer.length;
  let i = 0;

  while (i < len) {
    result.push(buffer.slice(i, i += chunkSize));
  }

  return result;
}

function readSource({ sources, indexFile }, filename) {
  return fs.readFile(filename, { encoding: null })
    .then((fileData) => {
      const zipped = zlib.gzipSync(fileData);
      const relativePath = path.relative(sources, filename);
      const chunks = makeChunks(zipped, 32767);
      const isIndexFile = relativePath === indexFile;

      return {
        urlPath: isIndexFile ? '' : relativePath.replace(/\\/g, '/'),
        contentType: mime.contentType(path.extname(filename)) || 'application/octet-stream',
        name: `static_${isIndexFile ? 'index' : relativePath.toLowerCase().replace(/[^\w+$]/gi, '_')}`,
        payloads: chunks.map((chunk, index) => ({
          chunkData: toHexPayload(chunk),
          chunkLength: chunk.length,
          chunkPart: index,
        })),
        length: zipped.length,
        cacheControl: isIndexFile ? 'no-cache' : 'public, max-age=31536000',
      };
    });
}

function writeFile(filename, contents) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(filename), (err) => {
      if (err) {
        reject(err);
      }

      return resolve(fs.writeFile(filename, contents));
    });
  });
}

function getSourcesFiles({ sources, exclude }) {
  return new Promise((resolve, reject) => {
    recursive(sources, exclude, (err, files) => {
      if (err) {
        return reject(err);
      }

      return resolve(files);
    });
  });
}

function renderAsset({
  name, contentType, payloads, length, cacheControl,
}) {
  return `void ${name} (Request &req, Response &res) {
${payloads.map(({ chunkData, chunkPart }) => `  P(${name}_${chunkPart}) = {\n   ${chunkData}  };`).join('\n')}

  res.set("Content-Type", "${contentType}");
  res.set("Content-Encoding", "gzip");
  res.set("Cache-Control", "${cacheControl}");
  res.set("Content-Length", "${length}");
  res.set("Last-Modified", "${runDate.toUTCString()}");
  res.set("Vary", "Accept-Encoding");

${payloads.map(({ chunkLength, chunkPart }) => `  res.writeP(${name}_${chunkPart}, ${chunkLength});`).join('\n')}
}`;
}

function renderRouter(sourceOptions) {
  return `

Router staticFileRouter("/");

Router * staticFiles(){
${sourceOptions.map(({ urlPath, name }) => `  staticFileRouter.get("${urlPath}", &${name});`).join('\n')}
  return &staticFileRouter;
}
`;
}

function generatePayloads({ sketchDir }, sourceOptions) {
  const destination = `${sketchDir}/StaticFiles.h`;
  const payloads = sourceOptions.map(renderAsset).join('\n\n');
  const router = renderRouter(sourceOptions);

  return writeFile(destination, payloads + router);
}

function generateFiles(options) {
  return getSourcesFiles(options)
    .then(filenames => Promise.all(filenames.map(filename => readSource(options, filename))))
    .then(sourceOptions => generatePayloads(options, sourceOptions));
}

module.exports = generateFiles;
