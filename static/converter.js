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
  const length = buffer.length;
  let i = 0;

  while (i < length) {
    result.push(buffer.slice(i, i += chunkSize));
  }

  return result;
}

function readSource({sources, indexFile}, filename) {
  return fs.readFile(filename, {encoding: null})
    .then(fileData => {
      const zipped = zlib.gzipSync(fileData);
      const relativePath = path.relative(sources, filename);
      const chunks = makeChunks(zipped, 32767);
      const isIndexFile = relativePath === indexFile;
      const urlPath = isIndexFile ? '' : relativePath.replace(/\\/g, '/');

      return {
        urlPath,
        contentType: mime.contentType(path.extname(filename)) || 'application/octet-stream',
        name: `static_${isIndexFile ? 'index' : relativePath.toLowerCase().replace(/[^\w+$]/gi, '_')}`,
        payloads: chunks.map((chunk, index) => ({
          chunkData: toHexPayload(chunk),
          chunkLength: chunk.length,
          chunkPart: index
        })),
        length: zipped.length,
        cacheControl: isIndexFile ? 'no-cache' : 'public, max-age=31536000'
      };
    });
}

function getSourcesFiles({sources, exclude = []}) {
  return new Promise((resolve, reject) => {
    recursive(sources, exclude, (error, files) => {
      if (error) {
        return reject(error);
      }

      return resolve(files);
    });
  });
}

function renderAsset({
  name, contentType, payloads, length, cacheControl
}) {
  return `void ${name} (Request &req, Response &res) {
${payloads.map(({chunkData, chunkPart}) => `  P(${name}_${chunkPart}) = {\n   ${chunkData}  };`).join('\n')}

  res.set("Content-Type", "${contentType}");
  res.set("Content-Encoding", "gzip");
  res.set("Cache-Control", "${cacheControl}");
  res.set("Content-Length", "${length}");
  res.set("Last-Modified", "${runDate.toUTCString()}");
  res.set("Vary", "Accept-Encoding");

${payloads.map(({chunkLength, chunkPart}) => `  res.writeP(${name}_${chunkPart}, ${chunkLength});`).join('\n')}
}`;
}

function renderRouter(sourceOptions) {
  return `

Router staticFileRouter;

Router * staticFiles(){
${sourceOptions.map(({urlPath, name}) => `  staticFileRouter.get("/${urlPath}", &${name});`).join('\n')}
  return &staticFileRouter;
}
`;
}

function generatePayloads({sketchDir}, sourceOptions) {
  const destination = path.join(sketchDir, 'StaticFiles.h');
  const payloads = sourceOptions.map(options => renderAsset(options)).join('\n\n');
  const router = renderRouter(sourceOptions);
  const content = payloads + router;

  return mkdirp(path.dirname(destination))
    .then(() => fs.writeFile(destination, content));
}

function generateFiles(options) {
  return getSourcesFiles(options)
    .then(filenames => Promise.all(filenames.map(filename => readSource(options, filename))))
    .then(sourceOptions => generatePayloads(options, sourceOptions));
}

module.exports = generateFiles;
