/* eslint-disable strict */

const path = require('path');

const mockParseFile = (filepath) => {
  const filename = path.basename(filepath);

  switch (filename) {
    case 'loop-relative-dependencies.yml':
      return { version: '3', tasks: { quux: { actions: [ { do: 'shell', command: 'echo corge' } ] } } };
    case 'nested-loop-relative-dependencies.yml':
      return { version: '3', tasks: { 
          quux: { actions: [ { do: 'corge' } ] },
          corge: { actions: [ { do: 'shell', command: 'echo uier' } ] }
        }
      };
    case 'nested-shell-relative-dependencies.yml':
      return { version: '3', tasks: { 
          baz: { actions: [ { do: 'qux' } ] },
          qux: { actions: [ { do: 'shell', command: 'echo quux' } ] }
        }
      };
    case 'shell-relative-dependencies.yml':
      return { version: '3', tasks: { baz: { actions: [ { do: 'shell', command: 'echo qux' } ] } } };
  }
};

jest.mock('../../lib/parse-file', () => mockParseFile);
const resolveDependencies = require('./resolve-dependencies');

describe('src/v3/lib/resolve-dependencies', function() {
  test('dependencies are resolved correctly for shell task with no dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'shell', command: 'echo bar' } ] };
    const usherfile = { tasks: { foo } };

    const expected = { name: 'foo', module: '.', task: foo, dependencies: [] };
    const actual = resolveDependencies(usherfile, taskName);

    expect(actual).toEqual(expected);
  });

  test('dependencies are resolved correctly for shell task with local dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'bar' } ] };
    const bar = { actions: [ { do: 'shell', command: 'echo baz' } ] };
    const usherfile = { tasks: { foo, bar } };

    const expected = { name: 'foo', module: '.', task: foo, dependencies: [{ name: 'bar', module: '.', task: bar, dependencies: [] }] };
    const actual = resolveDependencies(usherfile, taskName);

    expect(actual).toEqual(expected);
  });

  test('dependencies are resolved correctly for loop task with local dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'for', each: 'bar', in: 'baz', exec: 'qux' } ] };
    const qux = { actions: [ { do: 'shell', command: 'echo quux'} ] };
    const usherfile = { tasks: { foo, qux } };
    
    const expected = { name: 'foo', module: '.', task: foo, dependencies: [{ name: 'qux', module: '.', task: qux, dependencies: [] }] };
    const actual = resolveDependencies(usherfile, taskName);

    expect(actual).toEqual(expected); 
  });

  test('correct error is thrown for missing local dependency', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'for', each: 'bar', in: 'baz', exec: 'qux' } ] };
    
    const usherfile = { tasks: { foo } };
    const expected = /the task qux could not be found/;
    const actual = () => resolveDependencies(usherfile, taskName);

    expect(actual).toThrowError(expected); 
  });

  test('dependencies are resolved correctly for shell task with relative dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'bar.baz' } ] };
    const fooUsherfile = { includes: { bar: { from: 'shell-relative-dependencies.yml' } }, tasks: { foo } };
    const baz = { actions: [ { do: 'shell', command: 'echo qux' } ] };

    const expected = { name: 'foo', module: '.', task: foo, dependencies: [{ name: 'baz', module: 'bar', task: baz, dependencies: [] }] };
    const actual = resolveDependencies(fooUsherfile, taskName);

    expect(actual).toEqual(expected);
  });

  test('dependencies are resolved correctly for loop task with relative dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'for', each: 'bar', in: 'baz', exec: 'qux.quux' } ] };
    const fooUsherfile = { includes: { qux: { from: 'loop-relative-dependencies.yml' } }, tasks: { foo } };
    const quux = { actions: [ { do: 'shell', command: 'echo corge'} ] };
    
    const expected = { name: 'foo', module: '.', task: foo, dependencies: [{ name: 'quux', module: 'qux', task: quux, dependencies: [] }] };
    const actual = resolveDependencies(fooUsherfile, taskName);

    expect(actual).toEqual(expected); 
  });

  test('nested dependencies are resolved correctly for shell task with relative dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'bar.baz' } ] };
    const fooUsherfile = { includes: { bar: { from: 'nested-shell-relative-dependencies.yml' } }, tasks: { foo } };
    const baz = { actions: [ { do: 'qux' } ] };
    const qux = { actions: [ { do: 'shell', command: 'echo quux' } ] };

    const actual = resolveDependencies(fooUsherfile, taskName);
    const expected = {
      name: 'foo',
      module: '.',
      task: foo,
      dependencies: [
        { name: 'baz', module: 'bar', task: baz, dependencies: [{ name: 'qux', 'module': 'bar', task: qux, dependencies: [] }] }
      ]
    };

    expect(actual).toEqual(expected);
  });

  test('nested dependencies are resolved correctly for loop task with relative dependencies', function() {
    const taskName = 'foo';
    const foo = { actions: [ { do: 'for', each: 'bar', in: 'baz', exec: 'qux.quux' } ] };
    const fooUsherfile = { includes: { qux: { from: 'nested-loop-relative-dependencies.yml' } }, tasks: { foo } };
    const quux = { actions: [ { do: 'corge' } ] };
    const corge = { actions: [ { do: 'shell', command: 'echo uier' } ] }
    
    const actual = resolveDependencies(fooUsherfile, taskName);
    const expected = {
      name: 'foo',
      module: '.',
      task: foo,
      dependencies: [
        { name: 'quux', module: 'qux', task: quux, dependencies: [{ name: 'corge', module: 'qux', task: corge, dependencies: [] }] }
      ]
    };

    expect(actual).toEqual(expected); 
  });
});
