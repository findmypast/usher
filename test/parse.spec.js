var expect = require('chai').expect;
var parse = require('../src/commands/parse');

describe('YAML-to-commands parser', () => {
  var filename = 'test/test.usher.yml';
  var result = parse(filename);
  var tests = [
    {
      key: 'basic',
      expected: 'docker build -t usher .'
    },
    {
      key: 'custom',
      expected: 'do thing'
    },
    {
      key: 'sequence',
      expected: [
        'docker build -t usher .',
        'do thing'
      ]
    },
    {
      key: 'bogus',
      expected: false
    },
    {
      key: 'null',
      expected: false
    }
  ];

  tests.forEach( test =>
    it(`should make command ${test.key} ==> ${test.expected}`, () =>
      expect(result[test.key]).to.deep.equal(test.expected)));
});
