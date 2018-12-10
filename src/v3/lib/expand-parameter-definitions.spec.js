/* eslint-disable strict */

const expandParameterDefinitions = require('./expand-parameter-definitions');

describe('src/v3/lib/expand-parameter-definitions', function() {
  test('usherfile with no parameters is handled correctly', function () {
    const actual = expandParameterDefinitions(undefined);
    expect(actual).toEqual({});
  });

  test('all parameters are expanded to long form correctly', function() {
    const input = {
      param_a: 'short form',
      param_b: { description: 'required long form', default: undefined, required: true },
      param_c: { description: 'optional long form', default: 'foo', required: false },
    };

    const expected = {
      param_a: { description: 'short form', default: undefined, required: true },
      param_b: { description: 'required long form', default: undefined, required: true },
      param_c: { description: 'optional long form', default: 'foo', required: false },
    };

    const actual = expandParameterDefinitions(input);

    expect(actual).toEqual(expected);
  });
});
