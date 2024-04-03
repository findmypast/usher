'use strict';

const State = require('./state');
const Logger = require('../../../test/v2/mock-logger');
const _ = require('lodash');
const Promise = require('bluebird');
const errors = require('../lib/errors');

describe('core/task', () => {
  const id = 'test-id';
  jest.mock('crypto', () => ({ randomUUID: () => 'test-id' }));;
  const beginSpy = jest.spyOn(Logger, 'begin');
  const endSpy = jest.spyOn(Logger, 'end');
  const errorSpy = jest.spyOn(Logger, 'error');
  const failSpy = jest.spyOn(Logger, 'fail');

  const sut = require('./task');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('given valid input for simple task', () => {
    const output = 'test-output';
    const mockTask = jest.fn(() => [output]);
    const inputState = {
      tasks: {
        mock: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
      }
    };
    const inputTask = {
      do: 'mock',
      arg: 'test'
    };
    let state;
    let task;
    beforeEach(() => {
      task = _.cloneDeep(inputTask);
      state = new State(inputState, Logger);
    });
    test('adds an id to the task', () => {
      return sut(task, state)
        .then(() => {
          expect(task.id).toEqual(id);
        });
    });
    test('calls a task with merged state', () => {
      return sut(task, state)
        .then(() => {
          const mergedState = new State(inputState, Logger);
          mergedState.push(task);

          expect(mockTask).toBeCalledWith(expect.objectContaining({
              _state: mergedState._state,
              stack: [inputState, task]
            }));
        });
    });
    test('logs task start and end', () => {
      return sut(task, state)
        .then(() => {
          expect(beginSpy).toHaveBeenCalled();
          expect(endSpy).toHaveBeenCalled();
        });
    });
    test('pops state after completion', () => {
      return sut(task, state)
        .then(() => {
          expect(state).toEqual(new State(inputState, Logger));
        });
    });
    test('adds output to parent state if options.register is set', () => {
      const refName = 'registered';
      const registerTask = _.merge(task, {options: {register: refName}});
      return sut(registerTask, state)
        .then(() => {
          expect(state.get(refName)).toEqual(output);
        });
    });
  });

  describe('given valid input for task that returns results from multiple subtasks', () => {
    const output = ['output-from-task-1', 'output-from-task-2'];
    const mockTask = jest.fn(() => output);
    const inputState = {
      tasks: {
        mock: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
      }
    };
    const inputTask = {
      do: 'mock',
      arg: 'test'
    };
    let state;
    let task;
    beforeEach(() => {
      task = _.cloneDeep(inputTask);
      state = new State(inputState, Logger);
    });

    test('adds all output to parent state if options.register is set', () => {
      const refName = 'registered';
      const registerTask = _.merge(task, {options: {register: refName}});
      return sut(registerTask, state)
        .then(() => {
          expect(state.get(refName)).toEqual('output-from-task-1,output-from-task-2');
        });
    });

    test('adds the last tasks output to parent state if options.register_all is set', () => {
      const refName = 'last_registered';
      const registerTask = _.merge(task, {options: {register_last: refName}});
      return sut(registerTask, state)
        .then(() => {
          expect(state.get(refName)).toEqual('output-from-task-2');
        });
    });
  });

  describe('given input for task that does not exist', () => {
    const task = {do: 'wrong'};
    const state = new State({}, Logger);

    test('logs error and rejects', () => {
      const error = new errors.TaskNotFoundError(task.do);

      return expect(sut(task, state))
        .rejects
        .toEqual(error)
        .then(() => {
          expect(errorSpy).toHaveBeenCalledWith(error);
        });
    });
  });

  describe('given task rejects', () => {
    const taskError = new Error('test error');
    const mockTask = jest.fn(() => { throw taskError; });
    let task = {
      do: 'throws'
    };
    const inputState = {
      tasks: {
        throws: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
      }
    };
    let state;

    beforeEach(() => {
      state = new State(inputState, Logger);
    });

    test('logs error and rejects', () => {
      return expect(sut(_.cloneDeep(task), state))
        .rejects
        .toEqual(taskError)
        .then(() => {
          expect(failSpy).toHaveBeenCalledWith(taskError, 1, 1);
        });
    });
    test('logs error and resolves if options.ignore_errors is true', () => {
      const ignoreErrorsTask = _.merge({}, task, {options: {ignore_errors: true}});
      return sut(_.cloneDeep(ignoreErrorsTask), state)
        .then(() => {
          expect(failSpy).toHaveBeenCalledWith(taskError, 1, 1);
        });
    });
    test('retries the task 3 times if options.retry.retries = 2', () => {
      const retryTask = _.merge({}, task, {options: {retry: {retries: 2, minTimeout: 5}}});
      return expect(sut(_.cloneDeep(retryTask), state))
        .rejects
        .toEqual(taskError)
        .then(() => {
          expect(mockTask.mock.calls.length).toBe(3);
        });
    });
  });

  describe('finally_task behaviour', () => {
    let state;
    let task;

    const mockFinallyTask = jest.fn(() => 'output');
    const inputTask = {
      do: 'mock',
      arg: 'test'
    };
    beforeEach(() => {
      task = _.cloneDeep(inputTask);
    });

    describe('given valid task that returns results from multiple subtasks', () => {
      const output = ['output-from-task-1', 'output-from-task-2'];
      const mockTask = jest.fn(() => output);

      beforeEach(() => {
        var inputState = {
          tasks: {
            mock_finally: (state) => Promise.try(() => mockFinallyTask(_.cloneDeep(state))),
            mock: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
          }
        };
        state = new State(inputState, Logger);
      });

      test('calls finally_task if finally_task is set', () => {
        task.finally_task = 'mock_finally';
        return sut(task, state)
          .then(() => {
            expect(mockFinallyTask.mock.calls.length).toBe(1);
          });
      });
      test('does not call finally_task if finally_task is not set', () => {
        task.finally_task = undefined;
        return sut(task, state)
          .then(() => {
            expect(mockFinallyTask.mock.calls.length).toBe(0);
          });
      });
    });

    describe('given valid task that throws', () => {
      const taskError = new Error('test error');
      const mockTask = jest.fn(() => { throw taskError; });

      beforeEach(() => {
        var inputState = {
          tasks: {
            mock_finally: (state) => Promise.try(() => mockFinallyTask(_.cloneDeep(state))),
            mock: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
          }
        };
        state = new State(inputState, Logger);
      });

      test('calls finally_task if finally_task is set', () => {
        task.finally_task = 'mock_finally';
        return expect(sut(task, state))
          .rejects
          .toEqual(taskError)
          .then(() => {
            expect(mockFinallyTask.mock.calls.length).toBe(1);
          });
      });
      test('does not call finally_task if finally_task is not set', () => {
        task.finally_task = undefined;
        return expect(sut(task, state))
          .rejects
          .toEqual(taskError)
          .then(() => {
            expect(mockFinallyTask.mock.calls.length).toBe(0);
          });
      });
    });
  });
});
