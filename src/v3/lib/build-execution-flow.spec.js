const buildExecutionFlow = require('./build-execution-flow');

describe('src/v3/lib/build-execution-flow', function () {
  describe('correct execution flow built for', function () {
    /* No dependencies */

    test('task with single action with no dependencies', function () {
      const action = { do: 'shell', command: 'echo bar' };
      const input = { name: 'foo', module: '.', task: { actions: [ action ] }, dependencies: [] };
  
      const expected = [ action ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
  
    test('task with multiple sequential actions with no dependencies', function () {
      const actionBar = { do: 'shell', command: 'echo bar' };
      const actionBaz = { do: 'shell', command: 'echo baz' };
      const input = { name: 'foo', module: '.', task: { actions: [ actionBar, actionBaz ] }, dependencies: [] };
      
      const expected = [ actionBar, actionBaz ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
  
    test('task with multiple parallel actions with no dependencies', function () {
      const actionBar = { do: 'shell', command: 'echo bar' };
      const actionBaz = { do: 'shell', command: 'echo baz' };
      const input = { name: 'foo', module: '.', task: { parallel: true, actions: [ actionBar, actionBaz ] }, dependencies: [] };
      
      const expected = [ [ actionBar, actionBaz ] ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
    
    /* Local dependencies */

    test('task with single action with local dependency specifying single action', function () {
      const actionFoo = { do: 'bar' };
      const actionBar = { do: 'shell', command: 'echo baz' };
      const input = {
        name: 'foo',
        module: '.',
        task: { actions: [ actionFoo ] },
        dependencies: [{ name: 'bar', module: '.', task: { actions: [ actionBar ] }, dependencies: [] }]
      };
  
      const expected = [ actionBar ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
    
    test('task with single action with local dependency specifying multiple sequential actions', function () {
      const actionFoo = { do: 'bar' };
      const actionBar = { do: 'shell', command: 'echo baz' };
      const actionQux = { do: 'shell', command: 'echo quux' };
      const input = {
        name: 'foo',
        module: '.',
        task: { actions: [ actionFoo ] },
        dependencies: [{ name: 'bar', module: '.', task: { actions: [ actionBar, actionQux ] }, dependencies: [] }]
      };
  
      const expected = [ actionBar, actionQux ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
    
    test('task with single action with local dependency specifying multiple parallel actions', function () {
      const actionFoo = { do: 'bar' };
      const actionBar = { do: 'shell', command: 'echo baz' };
      const actionQux = { do: 'shell', command: 'echo quux' };
      const input = {
        name: 'foo',
        module: '.',
        task: { actions: [ actionFoo ] },
        dependencies: [{ name: 'bar', module: '.', task: { parallel: true, actions: [ actionBar, actionQux ] }, dependencies: [] }]
      };
  
      const expected = [ [ actionBar, actionQux ] ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
    
    /* Local, nested dependencies */

    test('task with single action with local, nested dependency specifying single action', function () {
      const actionFoo = { do: 'bar' };
      const actionBar = { do: 'baz' };
      const actionBaz = { do: 'shell', command: 'echo quz' }
      const input = {
        name: 'foo',
        module: '.',
        task: { actions: [ actionFoo ] },
        dependencies: [{
          name: 'bar',
          module: '.',
          task: { actions: [ actionBar ] },
          dependencies: [{
            name: 'baz',
            module: '.',
            task: { actions: [ actionBaz ] },
            dependencies: []
          }]
        }]
      };
  
      const expected = [ actionBaz ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
    
    test('task with single action with local, nested dependency specifying multiple sequential actions', function () {
      const actionFoo = { do: 'bar' };
      const actionBar = { do: 'shell', command: 'echo baz' };
      const actionQux = { do: 'quux' };
      const actionQuux = { do: 'shell', command: 'echo corge' };
      const input = {
        name: 'foo',
        module: '.',
        task: { actions: [ actionFoo ] },
        dependencies: [{ 
          name: 'bar', 
          module: '.', 
          task: { actions: [ actionBar, actionQux ] }, 
          dependencies: [{ 
            name: 'quux', 
            module: '.', 
            task: { actions: [ actionQuux ] }, 
            dependencies: []
          }]
        }]
      };
  
      const expected = [ actionBar, actionQuux ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
    
    test.skip('task with single action with local, nested dependency specifying multiple parallel actions', function () {
      const actionFoo = { do: 'bar' };
      const actionBar = { do: 'baz' };
      const actionBaz = { do: 'shell', command: 'echo qux' };
      const actionQuux = { do: 'shell', command: 'echo corge' };
      const input = {
        name: 'foo',
        module: '.',
        task: { actions: [ actionFoo ] },
        dependencies: [{ 
          name: 'bar', 
          module: '.', 
          task: { parallel: true, actions: [ actionBar, actionQuux ] }, 
          dependencies: [{ 
            name: 'baz', 
            module: '.', 
            task: { actions: [ actionBaz ] }, 
            dependencies: []
          }]
        }]
      };
  
      const expected = [ [ actionBaz, actionQuux ] ];
      const actual = buildExecutionFlow(input);
  
      expect(actual).toEqual(expected);
    });
  });
});