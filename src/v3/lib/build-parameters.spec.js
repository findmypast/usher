/* eslint-disable strict */

const buildParameters = require('./build-parameters');

describe('src/v3/lib/build-parameters', function() {
  test('parameter dictionary is built correctly', function() {
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
});
