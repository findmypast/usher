'use strict';

const sut = require('./list');

describe('commands/list', () => {

  describe('given valid input', () => {
    const expectedListResponse = require('../../../test/v2/list-response.json');
    const usherV2TestFile = 'test/v2/test.usher.yml';

    test('lists all tasks in usher file', () => {
      var opts = {
        file: usherV2TestFile
      };
      return expect(sut(null, opts))
        .resolves
        .toEqual(expectedListResponse);
    });
  });

});
