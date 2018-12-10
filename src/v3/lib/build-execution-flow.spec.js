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

  describe('with shallow dependencies', function () {
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

  describe('with mixed no dependencies and shallow dependencies', function () {
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


    test('nested sequences of actions are converted to a correct execution flow', function() {
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

  describe('with deep dependencies', function () {
    test('a single action is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [{
          name: 'bar',
          module: '.',
          dependencies: [{ name: 'baz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo baz' }] } }],
          task: { actions: [{ do: 'baz' }] } 
        }],
        task: { actions: [{ do: 'bar' }] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo baz' }];
  
      expect(actual).toEqual(expected);
    });

    test('a sequence of actions is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          {
            name: 'bar',
            module: '.',
            dependencies: [{ name: 'quux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo quux' }] } }], 
            task: { actions: [{ do: 'quux' }] }
          },
          {
            name: 'baz',
            module: '.',
            dependencies: [{ name: 'quuz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo quuz' }] } }],
            task: { actions: [{ do: 'quuz' }] }
          },
          {
            name: 'qux',
            module: '.',
            dependencies: [{ name: 'corge', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo corge' }] } }],
            task: { actions: [{ do: 'corge' }] }
          }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'qux'}] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo quux' }, { do: 'shell', command: 'echo quuz' }, { do: 'shell', command: 'echo corge' }];
  
      expect(actual).toEqual(expected);
    });

    test('concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          {
            name: 'bar',
            module: '.',
            dependencies: [{ name: 'quux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo quux' }] } }],
            task: { actions: [{ do: 'quux' }] }
          },
          {
            name: 'baz',
            module: '.',
            dependencies: [{ name: 'quuz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo quuz' }] } }],
            task: { actions: [{ do: 'quuz' }] }
          },
          {
            name: 'qux',
            module: '.',
            dependencies: [{ name: 'corge', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo corge' }] } }],
            task: { actions: [{ do: 'corge' }] }
          }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'qux'}], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [[{ do: 'shell', command: 'echo quux' }, { do: 'shell', command: 'echo quuz' }, { do: 'shell', command: 'echo corge' }]];
  
      expect(actual).toEqual(expected);
    });

    test('nested concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          {
            name: 'bar',
            module: '.',
            dependencies: [
              { name: 'baz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo grault' }], parallel: true } },
              { name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }, { do: 'shell', command: 'echo garply' }], parallel: true } }
            ],
            task: { actions: [{ do: 'baz' }, { do: 'qux' }], parallel: true }
          },
          {
            name: 'quux',
            module: '.',
            dependencies: [
              { name: 'quuz', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo quuz' }, { do: 'shell', command: 'echo waldo' }], parallel: true } },
              { name: 'corge', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo corge' }, { do: 'shell', command: 'echo fred' }], parallel: true } }
            ],
            task: { actions: [{ do: 'quuz' }, { do: 'corge' }], parallel: true }
          }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'quux' }], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [
        [
          [
            [ { do: 'shell', command: 'echo baz' }, { do: 'shell', command: 'echo grault' } ],
            [ { do: 'shell', command: 'echo qux' }, { do: 'shell', command: 'echo garply' } ]
          ], 
          [
            [ { do: 'shell', command: 'echo quuz' }, { do: 'shell', command: 'echo waldo' } ],
            [ { do: 'shell', command: 'echo corge' }, { do: 'shell', command: 'echo fred' } ]
          ]
        ]
      ];
  
      expect(actual).toEqual(expected);
    });
  });

  describe('with mix of no dependencies, shallow dependencies and deep dependencies', function () {
    test('a sequence of actions is converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          {
            name: 'bar',
            module: '.',
            dependencies: [], 
            task: { actions: [{ do: 'shell', command: 'echo bar' }] }
          },
          {
            name: 'baz',
            module: '.',
            dependencies: [{ name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } }],
            task: { actions: [{ do: 'qux' }] }
          },
          {
            name: 'quux',
            module: '.',
            dependencies: [{
              name: 'quuz',
              module: '.',
              dependencies: [{ name: 'corge', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo corge' }] } }],
              task: { actions: [{ do: 'corge' }] }
            }],
            task: { actions: [{ do: 'quuz' }] }
          }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'quux'}] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo qux' }, { do: 'shell', command: 'echo corge' }];
  
      expect(actual).toEqual(expected);
    });

    test('concurrent actions are converted to a correct execution flow', function() {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          {
            name: 'bar',
            module: '.',
            dependencies: [],
            task: { actions: [{ do: 'shell', command: 'echo bar' }] }
          },
          {
            name: 'baz',
            module: '.',
            dependencies: [{ name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } }],
            task: { actions: [{ do: 'qux' }] }
          },
          {
            name: 'quux',
            module: '.',
            dependencies: [{
              name: 'quuz',
              module: '.',
              dependencies: [{ name: 'corge', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo corge' }] } }],
              task: { actions: [{ do: 'corge' }] }
            }],
            task: { actions: [{ do: 'quuz' }] }
          }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'quux'}], parallel: true }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [[{ do: 'shell', command: 'echo bar' }, { do: 'shell', command: 'echo qux' }, { do: 'shell', command: 'echo corge' }]];
  
      expect(actual).toEqual(expected);
    });
    
    test('a sequence of actions containing concurrent actions are converted to a correct execution flow', function () {
      const input = {
        name: 'foo',
        module: '.',
        dependencies: [
          {
            name: 'bar',
            module: '.',
            dependencies: [], 
            task: { actions: [{ do: 'shell', command: 'echo bar' }] }
          },
          {
            name: 'baz',
            module: '.',
            dependencies: [
              { name: 'qux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo qux' }] } },
              { name: 'quux', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo quux' }] } }
            ],
            task: { actions: [{ do: 'qux' }, { do: 'quux' }], parallel: true }
          },
          {
            name: 'quuz',
            module: '.',
            dependencies: [{
              name: 'corge',
              module: '.',
              dependencies: [{ name: 'grault', module: '.', dependencies: [], task: { actions: [{ do: 'shell', command: 'echo grault' }] } }],
              task: { actions: [{ do: 'grault' }] }
            }],
            task: { actions: [{ do: 'corge' }] }
          }
        ],
        task: { actions: [{ do: 'bar' }, { do: 'baz' }, { do: 'quuz'}] }
      };
      
      const actual = buildExecutionFlow(input);
      const expected = [
        { do: 'shell', command: 'echo bar' },
        [{ do: 'shell', command: 'echo qux' }, { do: 'shell', command: 'echo quux' }],
        { do: 'shell', command: 'echo grault' }
      ];
  
      expect(actual).toEqual(expected);
    });
  });
});