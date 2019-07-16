const fs = require('fs');

describe('Converter', () => {
  beforeAll(() => {
    const DATE_TO_USE = new Date('2525');
    const OriginalDate = Date;
    global.Date = jest.fn(() => DATE_TO_USE);
    global.Date.UTC = OriginalDate.UTC;
    global.Date.parse = OriginalDate.parse;
    global.Date.now = OriginalDate.now;
  });

  afterAll(() => {
    fs.unlinkSync(`${__dirname}/test-temp/StaticFiles.h`);
    fs.rmdirSync(`${__dirname}/test-temp`);
  });


  test('Produces the expected output', async () => {
    await require('./converter')({ // eslint-disable-line global-require
      sources: './static/test-input',
      indexFile: 'converter.test.html',
      sketchDir: './static/test-temp',
      exclude: [
        'converter.js',
        'converter.test.js',
        'index.js',
      ],
    });

    const result = fs.readFileSync(`${__dirname}/test-temp/StaticFiles.h`, 'utf8');
    const darvinResult = fs.readFileSync(`${__dirname}/test-results/Darvin.ino`, 'utf8');
    const linuxResult = fs.readFileSync(`${__dirname}/test-results/Linux.ino`, 'utf8');

    const expectedResult = process.platform === 'darvin' ? darvinResult : linuxResult;

    expect(result).toEqual(expectedResult);
  });
});
