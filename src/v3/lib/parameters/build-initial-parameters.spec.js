const buildParameters = require('./build-initial-parameters');

describe('src/v3/lib/parameters/build-initial-parameters', function() {
  const parameterDefinitions = {
    param_a: { description: 'short form', default: undefined, required: true },
    param_b: { description: 'required long form', default: undefined, required: true },
    param_c: { description: 'optional long form', default: 'bar', required: false },
  };

  test('initial parameter dictionary is built using definitions correctly', function() {
    const taskName = 'foo';
    const taskParameters = ['param_a', 'param_c'];

    const expected = {
      param_a: { lazy: false, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'bar' },
    };

    const actual = buildParameters(taskName, taskParameters, parameterDefinitions);

    expect(actual).toEqual(expected);
  });

  test('use of parameter not declared in usherfile results in an error', function () {
    const taskName = 'foo';
    const taskParameters = ['param_a', 'param_d'];
    const harness = () => buildParameters(taskName, taskParameters, parameterDefinitions);

    expect(harness).toThrowError(/^the parameter param_d .+ was not declared/);
  });
});
