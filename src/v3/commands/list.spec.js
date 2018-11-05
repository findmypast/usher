/* eslint-disable strict */

const list = require('./list');
const path = require('path');

describe('v3/commands/list', () => {
  describe('given valid input', () => {
    const expected = require('./spec-data/list-response.json');
    const file = path.join(__dirname, 'spec-data', 'list.yml');

    test('lists all tasks in usher file', async function() {
      var opts = { file };
      await expect(list(null, opts)).resolves.toEqual(expected);
    });
  });
});
