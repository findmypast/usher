const buildArguments = require('./build-arguments');

describe('src/v3/lib/build-arguments', function() {
  test('argument dictionary is built correctly', function() {
    const input = ['foo=bar', 'baz=qux'];
    const expected = { foo: 'bar', baz: 'qux' };
    const actual = buildArguments(input);

    expect(actual).toEqual(expected);
  });
});
