const buildExecutionFlow = require('./build-execution-flow');

describe('src/v3/lib/build-execution-flow', function () {
  describe('with no dependencies', function () {
    test('a single action is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [],
        task: { actions: [{ do: 'shell', command: 'echo foo' }] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo foo' }];
  
      expect(actual).toEqual(expected);
    });

    test('a sequence of actions is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [],
        task: { actions: [{ do: 'shell', command: 'echo foo' }, { do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo foo' }, { do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }];
  
      expect(actual).toEqual(expected);
    });

    test('concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [],
        task: { actions: [{ do: 'shell', command: 'echo foo' }, { do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [[{ do: 'shell', command: 'echo foo' }, { do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }]];
  
      expect(actual).toEqual(expected);
    });
  });

  describe('with shallow local dependencies', function () {
    test('a single action is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [{ name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }] } }],
        task: { actions: [{ do: 'bar' }] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo bar' }];
  
      expect(actual).toEqual(expected);
    });

    test('a sequence of actions is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          { name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }] } },
          { name: 'baz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo baz' }] } },
          { name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'qux'}] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo qux' }];
  
      expect(actual).toEqual(expected);
    });

    test('concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          { name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }] } },
          { name: 'baz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo baz' }] } },
          { name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'qux'}], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [[{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo qux' }]];
  
      expect(actual).toEqual(expected);
    });
  });

  describe('with mixed no dependencies and shallow local dependencies', function () {
    test('a sequence of actions is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          { name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }] } },
          { name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'shell', command: 'echo baz' }, { do: 'qux'}] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo qux' }];
  
      expect(actual).toEqual(expected);
    });


    test('nested sequences of actions is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          { name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo qux' }] } },
          { name: 'baz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo quux' }] } }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [
        { do: 'shell', command: 'echo bar' },
        { do: 'shell', command: 'echo qux' },
        { do: 'shell', command: 'echo baz' },
        { do: 'shell', command: 'echo quux' }
      ];
  
      expect(actual).toEqual(expected);
    });

    test('concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          { name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }] } },
          { name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'shell', command: 'echo baz' }, { do: 'qux'}], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [[{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo qux' }]];
  
      expect(actual).toEqual(expected);
    });

    test('nested concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          { name: 'bar', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo qux' }], parallel: true } },
          { name: 'baz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo quux' }], parallel: true } }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [[ 
        [ { do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo qux' } ], 
        [ { do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo quux' } ] 
      ]];
  
      expect(actual).toEqual(expected);
    });
  });

  describe('with deep local dependencies', function () {
    // todo
  });
});