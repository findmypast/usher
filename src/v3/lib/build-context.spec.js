const buildContext = require('./build-context');

describe('src/v3/lib/build-context', function () {
  test('with no variables or parameters', function () {
    const variables = {};
    const parameters = {};
    const actual = buildContext(variables, parameters);
    const expected = {};
    
    expect(actual).toEqual(expected);
  });

  test('with no variables and some parameters', function () {
    const variables = {};
    const parameters = { param_a: 'foo' };
    const actual = buildContext(variables, parameters);
    const expected = { param_a: 'foo' };
    
    expect(actual).toEqual(expected);
  });

  test('with some variables and no parameters', function () {
    const variables = { var_a: 'foo' };
    const parameters = {};
    const actual = buildContext(variables, parameters);
    const expected = { var_a: 'foo' };
    
    expect(actual).toEqual(expected);
  });

  test('with non-clashing variables and parameters', function () {
    const variables = { var_a: 'foo' };
    const parameters = { param_a: 'bar' };
    const actual = buildContext(variables, parameters);
    const expected = { param_a: 'bar', var_a: 'foo' };
    
    expect(actual).toEqual(expected);
  });

  test('with clashing variables and parameters variables take precedence', function () {
    const variables = { foo: 'bar' };
    const parameters = { foo: 'baz' };
    const actual = buildContext(variables, parameters);
    const expected = { foo: 'bar' };
    
    expect(actual).toEqual(expected);
  });
});