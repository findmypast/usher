"use strict";

const expect = require('chai').expect;
const parse = require('../../src/commands/parse');

describe('YAML-to-commands parser', () => {
  let filename = 'test/test.usher.yml';
  let result = parse(filename);
  let tests = [
    {
      key: 'basic',
      expected: [{ command: 'docker build -t usher .', settings: {}}]
    },
    {
      key: 'custom',
      expected: [{ command: 'do thing', settings: {} }]
    },
    {
      key: 'sequence',
      expected: [
        { command: 'docker build -t usher .', settings: {} },
        { command: 'do thing', settings: {} }
      ]
    },
    {
      key: 'retry',
      expected: [{
        command: 'docker build  .',
        settings: {
          retry: {
            attempts: 5
          }
        }
      }]
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
    it(`should make preset ${test.key} ==>
      "${test.expected.command}" with settings "${test.expected.settings}"`, () =>
      expect(result[test.key]).to.deep.equal(test.expected)));
});
