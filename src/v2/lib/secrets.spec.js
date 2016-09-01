/* global describe it expect*/
'use strict';

const secrets = require('./secrets');
const _ = require('lodash');

describe('lib/secrets', function() {

  const tests = [
    {
      config: {
        vars: {
          a: 'b',
          c: 'd',
          secret: 'cantseeme',
          another_secret: 'supersecret'
        },
        hide_vars: ['secret', 'another_secret']
      },
      expected_values: ['cantseeme', 'supersecret'],
      message: 'extracts the values of the vars which are marked to be hidden'
    },
    {
      config: {
        vars: {
          a: 'b',
          c: 'd',
          secret: 'cantseeme',
          another_secret: 'supersecret'
        },
        hide_vars: []
      },
      expected_values: [],
      message: 'return empty array for no hidden values specified'
    },
    {
      config: {
        vars: {
          a: 'b',
          c: 'd'
        },
        hide_vars: ['secret', 'another_secret']
      },
      expected_values: [],
      message: 'return empty array for no matching vars'
    }
  ];

  _.forEach(tests, (test) => {
    it(test.message, function() {
      expect(secrets(test.config)).to.deep.equal(test.expected_values);
    });
  });

});
