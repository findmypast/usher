'use strict';

const _ = require('lodash');
const errors = require('../lib/errors');
const State = require('../core/state');

describe('commands/run', () => {
  var opts = {};
  var taskVars;
  let sut;

  jest.mock('../loggers');
  const loggers = require('../loggers');
  loggers.verbose = jest.fn();
  loggers.quiet = jest.fn();

  jest.mock('./setup');
  const setup = require('./setup');

  jest.mock('../core/task');
  const task = require('../core/task');

  jest.mock('./parse');
  const parse = require('./parse');

  beforeEach(() => {
    opts = {};
    taskVars = ['version=test'];
    sut = require('./run');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('given valid input', () => {
    const setupResponse = require('../../../test/v2/setup-response');
    const initialState = require('../../../test/v2/initial-state.json');
    const usherV2TestFile = 'test/v2/test.usher.yml';

    beforeEach(() => {
      setup.mockImplementation(setupResponse);
      task.mockImplementation(() => Promise.resolve(true));
      parse.mockImplementation(() => initialState);
    });

    test('calls parse on the file name defined in opts', () => {
      opts.file = usherV2TestFile;

      return sut('build', taskVars, opts)
        .then(() => {
          expect(parse).toBeCalledWith(opts.file);
        });
    });
    test('calls parse on "usher.yml" if no file option', () => {
      opts.file = null;

      return sut('build', taskVars, opts)
        .then(() => {
          expect(parse).toBeCalledWith('usher.yml');
        });
    });
    test('parses CLI vars and merges them into config before calling setup', () => {
      opts.file = null;
      taskVars.push('arg2="blah=p\nlap"');
      taskVars.push('arg1=plop');
      var expectedVars = {
        version: 'test',
        arg1: 'plop',
        arg2: '"blah=p\nlap"'
      };

      return sut('build', taskVars, opts)
        .then(() => {
          expect(setup.mock.calls[0][0].vars).toEqual(expectedVars);
        });
    });
    test('given no vars calls setup with config', () => {
      initialState.vars = {};
      return sut('build', [], {})
        .then(() => {
          expect(setup.mock.calls[0][0]).toEqual(initialState);
        });
    });
    test('if passed the option verbose use verbose logger', () => {
      return sut('build', [], {verbose: true})
        .then(() => {
          expect(setup.mock.calls[0][1]).toEqual(loggers.verbose);
        });
    });
    test('if passed the option quiet use quiet logger', () => {
      return sut('build', [], {quiet: true})
        .then(() => {
          expect(setup.mock.calls[0][1]).toEqual(loggers.quiet);
        });
    });
    test('runs the named task', () => {
      var expectedTaskConfig = (new State(initialState, loggers.quiet)).get('tasks.build');
      expectedTaskConfig.name = 'build';

      return sut(expectedTaskConfig.name, taskVars, opts)
        .then(() => {
          expect(task.mock.calls[0][0]).toEqual(expectedTaskConfig);
        });
    });
    test('runs the named remote task', () => {
      taskVars.push('service_name=mergle');
      var expectedTaskConfig = (new State(initialState, loggers.quiet)).get('tasks.global.tasks.docker.tasks.create_image');
      expectedTaskConfig.name = 'global.docker.create_image';

      return sut(expectedTaskConfig.name, taskVars, opts)
        .then(() => {
          expect(task.mock.calls[0][0]).toEqual(expectedTaskConfig);
        });
    });
    test('should silently ignore the missing catch/final task when the main task fails', () => {
      task
        .mockImplementationOnce(() => Promise.reject('Task error'))
        .mockImplementationOnce(() => Promise.resolve(true))
        .mockImplementationOnce(() => Promise.resolve(true));

      return sut('build', taskVars, opts)
        .catch((error) => {
          expect(error).toEqual('Task error');
        });
    });

    describe('for a task with a catch/finally task', () => {

      beforeEach(() => {
        task.mockClear();
      });

      test('calls the "catch" task when the called task fails', () => {
        task
          .mockImplementationOnce(() => Promise.reject('Task error'))
          .mockImplementationOnce(() => Promise.resolve(true))
          .mockImplementationOnce(() => Promise.resolve(true));

        var taskConfig = (new State(initialState, loggers.quiet)).get('tasks.global.tasks.deploy.tasks.deploy_blue_green_with_cleanup');
        taskConfig.name = 'global.deploy.deploy_blue_green_with_cleanup';
        var catchTaskConfig = (new State(initialState, loggers.quiet)).get('tasks.global.tasks.deploy.tasks.cleanup_deployed_containers');
        catchTaskConfig.name = 'global.deploy.cleanup_deployed_containers';

        return sut(taskConfig.name, taskVars, opts)
          .catch(() => {
            expect(task.mock.calls[1][0]).toEqual(catchTaskConfig);
          });
      });
      test('calls the task-specific "finally" task when the called task succeeds', () => {
        task
          .mockImplementationOnce(() => Promise.resolve(true))
          .mockImplementationOnce(() => Promise.resolve(true))
          .mockImplementationOnce(() => Promise.resolve(true));

        var taskConfig = (new State(initialState, loggers.quiet)).get('tasks.sniff');
        taskConfig.name = 'sniff';
        var catchTaskConfig = (new State(initialState, loggers.quiet)).get('tasks.build');
        catchTaskConfig.name = 'build';

        return sut(taskConfig.name, taskVars, opts)
          .catch(() => {
            expect(task.mock.calls[1][0]).toEqual(catchTaskConfig);
          });
      });
      test('should return both errors when the called task fails and the catch/finally task fails', () => {
        task
          .mockImplementationOnce(() => Promise.reject('Task error'))
          .mockImplementationOnce(() => Promise.reject('Catch error'))
          .mockImplementationOnce(() => Promise.resolve(true));

        var taskConfig = (new State(initialState, loggers.quiet)).get('tasks.global.tasks.deploy.tasks.deploy_blue_green_with_cleanup');
        taskConfig.name = 'global.deploy.deploy_blue_green_with_cleanup';

        return sut(taskConfig.name, taskVars, opts)
          .catch((error) => {
            expect(error).toEqual(`Unrecoverable error when handling catch/finally block:\nError: Catch error\nOriginal error:\nError: Task error`);
          });
      });
    });

  });

  describe('given invalid input', () => {

    beforeEach(() => {
      setup.mockImplementation(() => Promise.resolve(new State({}, loggers.quiet)));
      task.mockImplementation(() => Promise.resolve(true));
      parse.mockImplementation(() => {});
    });

    test('rejects if named task is not found', () => {
      return expect(sut('any_task', taskVars, opts))
        .rejects
        .toEqual(new errors.TaskNotFoundError('tasks.any_task'));
    });
    test('rejects if file fails to parse', () => {
      parse.mockImplementation(() => {throw new Error('Test Error')});
      return expect(sut('any_task', taskVars, opts))
        .rejects
        .toEqual(new errors.ParsingError({message: 'Test Error'}, 'usher.yml'));
    });
  });

});
