const buildParameters = require('./build-parameters');

describe('src/v3/lib/build-parameters', function() {
  test('parameter dictionary is built correctly when no parameters exist', function () {
    const taskName = 'foo';
    const task = { actions: [{ do: 'shell', command: 'echo foo' }] };
    const parameterDefinitions = {};
    const taskArguments = {};
    const expected = {};
    const actual = buildParameters(taskName, task, parameterDefinitions, taskArguments);

    expect(actual).toEqual(expected);
  });

  test('the correct error is thrown when parameter dictionary is empty but task parameters exist', function () {
    const taskName = 'foo';
    const task = { actions: [{ do: 'shell', command: 'echo foo' }], params: ['param_a'] };
    const parameterDefinitions = {};
    const taskArguments = {};
    const expected = /the parameter param_a used by task foo was not declared./;
    const actual = () => buildParameters(taskName, task, parameterDefinitions, taskArguments);

    expect(actual).toThrowError(expected);
  });

  test('the correct error is thrown when parameter dictionary and task params are empty but task arguments exist', function () {
    const taskName = 'foo';
    const task = { actions: [{ do: 'shell', command: 'echo foo' }] };
    const parameterDefinitions = {};
    const taskArguments = { param_a: 'foo' };
    const expected = /the argument param_a supplied to task foo is not used./;
    const actual = () => buildParameters(taskName, task, parameterDefinitions, taskArguments);

    expect(actual).toThrowError(expected);
  });

  test('parameter dictionary is built correctly when all parameters are used', function() {
    const taskName = 'foo';

    const task = {
      params: ['param_a', 'param_b', 'param_c'],
      actions: [
        { do: 'shell', command: 'echo foo', options: { register: 'param_b' } },
        { do: 'quux <%= param_a %>' },
        { do: 'for', iteratee: 'qux', in: 'param_c', exec: 'corge <%=  param_b  %>' }
      ]
    };

    const parameterDefinitions = {
      param_a: { description: 'short form', default: undefined, required: true },
      param_b: { description: 'required long form', default: undefined, required: true },
      param_c: { description: 'optional long form', default: 'bar', required: false },
    };

    const taskArguments = { param_a: 'bar', param_c: 'baz' };
    
    const expected = {
      param_a: { lazy: false, required: true, value: 'bar' },
      param_b: { lazy: true, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'baz' },
    };

    const actual = buildParameters(taskName, task, parameterDefinitions, taskArguments);

    expect(actual).toEqual(expected);
  });

  test('parameter dictionary is built correctly when some parameters are unused', function() {
    const taskName = 'foo';

    const task = {
      params: ['param_a', 'param_b', 'param_c'],
      actions: [
        { do: 'shell', command: 'echo foo', options: { register: 'param_b' } },
        { do: 'quux param=<%= param_a %>' },
        { do: 'for', iteratee: 'qux', in: 'param_c', exec: 'corge param=<%=  param_b  %>' }
      ]
    };

    const parameterDefinitions = {
      param_a: { description: 'short form', default: undefined, required: true },
      param_b: { description: 'required long form', default: undefined, required: true },
      param_c: { description: 'optional long form', default: 'bar', required: false },
      param_d: { description: 'another short form', default: undefined, required: true },
    };

    const taskArguments = { param_a: 'bar', param_c: 'baz' };
    
    const expected = {
      param_a: { lazy: false, required: true, value: 'bar' },
      param_b: { lazy: true, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'baz' },
    };

    const actual = buildParameters(taskName, task, parameterDefinitions, taskArguments);

    expect(actual).toEqual(expected);
  });

  test('error is thrown when an undeclared parameter is referenced by a task', function() {
    const taskName = 'foo';

    const task = {
      params: ['param_a', 'param_b', 'param_d'],
      actions: [
        { do: 'shell', command: 'echo foo', options: { register: 'param_b' } },
        { do: 'quux <%= param_a %>' },
        { do: 'for', iteratee: 'qux', in: 'param_d', exec: 'corge <%=  param_b  %>' }
      ]
    };

    const parameterDefinitions = {
      param_a: { description: 'short form', default: undefined, required: true },
      param_b: { description: 'required long form', default: undefined, required: true },
      param_c: { description: 'optional long form', default: 'bar', required: false },
    };

    const taskArguments = { param_a: 'bar', param_d: 'baz' };
    
    const expected = /the parameter param_d used by task foo was not declared./;

    const actual = () => buildParameters(taskName, task, parameterDefinitions, taskArguments);

    expect(actual).toThrowError(expected);
  });
});
