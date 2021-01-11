const path = require('path');
const zlib = require('zlib');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const mime = require('mime-types');
const recursive = require('recursive-readdir');
const perfectHash = require('./perfect-hash');

const runDate = new Date();

function getHeaders({
  contentType, contentLength, cacheControl, lastModified,
}) {
  return Buffer.from(
    `Content-Type: ${contentType}\r\n`
    + 'Content-Encoding: gzip\r\n'
    + `Cache-Control: ${cacheControl}\r\n`
    + `Content-Length: ${contentLength}\r\n`
    + `Last-Modified: ${lastModified}\r\n`
    + 'Vary: Accept-Encoding\r\n'
    + '\r\n',
  );
}

function readSource({ sources, indexFile }, filename) {
  const fileData = fs.readFileSync(filename, { encoding: null });
  const relativePath = path.relative(sources, filename);
  const isIndexFile = relativePath === indexFile;
  const urlPath = isIndexFile ? '' : relativePath.replace(/\\/g, '/');
  const encodedPath = `/${encodeURI(urlPath)}`;
  const contentType = mime.contentType(path.extname(filename)) || 'application/octet-stream';
  const cacheControl = isIndexFile ? 'no-cache' : 'public, max-age=31536000';
  const body = zlib.gzipSync(fileData);
  const contentLength = body.length;
  const lastModified = runDate.toUTCString();
  const headers = getHeaders({
    contentType, contentLength, cacheControl, lastModified,
  });
  const length = contentLength + headers.length;
  const hash = perfectHash.hash(encodedPath);

  return {
    filename,
    encodedPath,
    length,
    headers,
    hash,
    contentType,
    contentLength,
    cacheControl,
    lastModified,
  };
}

function getSourcesFiles({ sources, exclude = [] }) {
  return new Promise((resolve, reject) => {
    recursive(sources, exclude, (err, files) => {
      if (err) {
        return reject(err);
      }

      return resolve(files);
    });
  });
}

function getOffsets(sourceOptions) {
  let currentPosition = 4 + (sourceOptions.length * 16);
  return sourceOptions.map((option) => {
    const offset = currentPosition;
    currentPosition += option.length;
    return { offset, ...option };
  });
}

function createTables(sourceOptions) {
  const dictionary = {};
  sourceOptions.forEach(({
    encodedPath, offset, hash, length,
  }) => {
    dictionary[encodedPath] = { offset, hash, length };
  });

  return perfectHash.create(dictionary);
}

async function generatePayloads({ sketchDir }, sourceOptions) {
  const dataFile = `${sketchDir}/static.bin`;
  const offsettedOptions = getOffsets(sourceOptions);
  const tables = createTables(offsettedOptions);

  await mkdirp(path.dirname(dataFile));

  const binaryStream = fs.createWriteStream(dataFile, { encoding: 'binary' });

  binaryStream.write(Buffer.from(Uint32Array.from([sourceOptions.length]).buffer));
  binaryStream.write(Buffer.from(Int32Array.from(tables[0]).buffer));
  tables[1].forEach(({ offset, hash, length }) => {
    binaryStream.write(Buffer.from(Uint32Array.from([hash, offset, length]).buffer));
  });

  offsettedOptions.forEach((options) => {
    const data = fs.readFileSync(options.filename, { encoding: null });
    const body = zlib.gzipSync(data);
    const headers = getHeaders(options);
    binaryStream.write(headers);
    binaryStream.write(body);
  });
}

function generateFiles(options) {
  return getSourcesFiles(options)
    .then((filenames) => Promise.all(filenames.map((filename) => readSource(options, filename))))
    .then((sourceOptions) => generatePayloads(options, sourceOptions));
}

module.exports = generateFiles;
