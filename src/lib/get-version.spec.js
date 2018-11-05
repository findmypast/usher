/* eslint-disable strict */

jest.mock('./config', () => ({ defaultFilenames: ['foo.bar', 'baz.qux'] }));
const getVersion = require('./get-version');
const path = require('path');

describe('lib/get-version', function() {
  test('"0" is returned for a non-existent usher file', async function() {
    expect.assertions(1);
    const vNonExistent = path.join(__dirname, 'spec-data', 'usher-vNonExistent.yml');
    await expect(getVersion(vNonExistent)).rejects.toThrowError(/^an usher file could not be found/);
  });
  
  test('"0" is returned for an usher file with an invalid version line', async function() {
    expect.assertions(1);
    const vInvalid = path.join(__dirname, 'spec-data', 'usher-vInvalid.yml');
    await expect(getVersion(vInvalid)).resolves.toEqual('0');
  });
  
  test('"1" is returned for a v1 compatible usher file', async function() {
    expect.assertions(1);
    const v1 = path.join(__dirname, 'spec-data', 'usher-v1.yml');
    await expect(getVersion(v1)).resolves.toEqual('1');
  });
  
  test('"2" is returned for a v2 compatible usher file', async function() {
    expect.assertions(1);
    const v2 = path.join(__dirname, 'spec-data', 'usher-v2.yml');
    await expect(getVersion(v2)).resolves.toEqual('2');
  });
  
  test('"3" is returned for a v3 compatible usher file', async function() {
    expect.assertions(1);
    const v3 = path.join(__dirname, 'spec-data', 'usher-v3.yml');
    await expect(getVersion(v3)).resolves.toEqual('3');
  });
});
