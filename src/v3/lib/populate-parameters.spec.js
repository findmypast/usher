/* eslint-disable strict */

const populateParameters = require('./populate-parameters');

describe('src/v3/lib/populate-parameters', function() {
  test('parameters are populated using arguments correctly', function() {
    const initialParameters = {
      param_a: { lazy: false, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'bar' },
    };

    const taskArguments = {
      param_a: 'foo',
      param_c: 'baz'
    };

    const expected = {
      param_a: { lazy: false, required: true, value: 'foo' },
      param_c: { lazy: false, required: false, value: 'baz' },
    };

    const actual = populateParameters(initialParameters, taskArguments);

    expect(actual).toEqual(expected);
  });

  test('parameters are populated using arguments correctly when a default exists and no argument is provided', function() {
    const initialParameters = {
      param_a: { lazy: false, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'bar' },
    };

    const taskArguments = {
      param_a: 'foo',
    };

    const expected = {
      param_a: { lazy: false, required: true, value: 'foo' },
      param_c: { lazy: false, required: false, value: 'bar' },
    };

    const actual = populateParameters(initialParameters, taskArguments);

    expect(actual).toEqual(expected);
  });
});
