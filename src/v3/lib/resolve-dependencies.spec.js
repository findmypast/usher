/* eslint-disable strict */

const resolveDependencies = require('./resolve-dependencies');

describe('src/v3/lib/resolve-dependencies', function() {
  test('dependencies are resolved correctly for shell task with no dependencies', function() {
    const taskName = 'foo';
    
    const usherfile = {
      tasks: {
        foo: {
          actions: [
            { do: 'shell', command: 'echo bar' }
          ]
        }
      }
    };
    
    const expected = { task: 'foo', dependencies: [] };
    
    const actual = resolveDependencies(usherfile, taskName);

    expect(actual).toEqual(expected);
  });

  test('dependencies are resolved correctly for shell task with local dependencies', function() {
    const taskName = 'foo';
    
    const usherfile = {
      tasks: {
        foo: {
          actions: [
            { do: 'bar' }
          ]
        },
        bar: {
          actions: [
            { do: 'shell', command: 'echo baz' }
          ]
        }
      }
    };

    const expected = { task: 'foo', dependencies: [{ task: 'bar', dependencies: [] }] };
    
    const actual = resolveDependencies(usherfile, taskName);

    expect(actual).toEqual(expected);
  });

  test('dependencies are resolved correctly for loop task with local dependencies', function() {
    const taskName = 'foo';
    
    const usherfile = {
      tasks: {
        foo: {
          actions: [
            { do: 'for', each: 'bar', in: 'baz', exec: 'qux' }
          ]
        },
        qux: {
          actions: [
            { do: 'shell', command: 'echo quux'}
          ]
        }
      }
    };
    
    const expected = { task: 'foo', dependencies: [{ task: 'qux', dependencies: [] }] };
    
    const actual = resolveDependencies(usherfile, taskName);

    expect(actual).toEqual(expected); 
  });

  test('correct error is thrown for missing local dependency', function() {
    const taskName = 'foo';
    
    const usherfile = {
      tasks: {
        foo: {
          actions: [
            { do: 'for', each: 'bar', in: 'baz', exec: 'qux' }
          ]
        }
      }
    };

    const expected = /the task qux could not be found/;
    
    const actual = () => resolveDependencies(usherfile, taskName);

    expect(actual).toThrowError(expected); 
  });
});
