const markLazyParameters = require('./mark-lazy-parameters');

describe('src/v3/lib/parameters/mark-lazy-parameters', function() {
  const populatedParameters = {
    param_a: { lazy: false, required: true, value: 'foo' },
    param_b: { lazy: false, required: true, value: undefined },
    param_c: { lazy: false, required: false, value: 'bar' },
  };

  test('all unpopulated parameters registered before use are marked as lazy', function() {
    const actions = [
      { do: 'shell', command: 'echo foo', options: { register: 'param_b' } },
      { do: 'shell', command: 'echo <%=param_b%>' }
    ];

    const expected = {
      param_a: { lazy: false, required: true, value: 'foo' },
      param_b: { lazy: true, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'bar' },
    }

    const actual = markLazyParameters(populatedParameters, actions);

    expect(actual).toEqual(expected);
  });

  test('all unpopulated parameters not registered before use are not marked as lazy', function() {
    const actions = [{ do: 'shell', command: 'echo <%=param_b%>' }];

    const expected = {
      param_a: { lazy: false, required: true, value: 'foo' },
      param_b: { lazy: false, required: true, value: undefined },
      param_c: { lazy: false, required: false, value: 'bar' },
    }

    const actual = markLazyParameters(populatedParameters, actions);

    expect(actual).toEqual(expected);
  });
});
