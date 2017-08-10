'use strict';

const State = require('../core/state');
const Promise = require('bluebird');
const Logger = require('../../../test/v2/mock-logger');

describe('tasks/for', () => {
  jest.mock('../core/task');
  const task = require('../core/task');

  const sut = require('./for');
  let state;

  beforeEach(() => {
    task.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('given valid input, running parallel', () => {
    const options = {
      do: 'for',
      every: 'thing',
      in: 'first-thing, second-thing',
      exec: 'task'
    };

    describe('with \'in\' as a comma-separated list', () => {
      beforeEach(() => {
        options.in = 'first-thing, second-thing';
        state = new State(options, Logger);
      });

      test('executes the tasks with each value', () => {
        return sut(state)
          .then(() => {
            expect(task.mock.calls[0][0]).toMatchObject({do: options.exec, thing: options.in.split(',')[0]});
            expect(task.mock.calls[1][0]).toMatchObject({do: options.exec, thing: options.in.split(',')[1]});
          });
      });

      describe('if one step fails', () => {
        const expectedError = new Error('Test error');

        beforeEach(() => {
          task.mockImplementation(() => Promise.reject(expectedError));
        });

        test('should reject', () => {
          return expect(sut(state))
            .rejects
            .toEqual(expectedError);
        });
      });
    });

    describe('with \'in\' as an array', () => {
      beforeEach(() => {
        options.in = ['first-thing', 'second-thing'];
        state = new State(options, Logger);
      });

      test('executes the tasks with each value', () => {
        return sut(state)
          .then(() => {
            expect(task.mock.calls[0][0]).toMatchObject({do: options.exec, thing: options.in[0]});
            expect(task.mock.calls[1][0]).toMatchObject({do: options.exec, thing: options.in[1]});
          });
      });

      describe('if one step fails', () => {
        const expectedError = new Error('Test error');

        beforeEach(() => {
          task.mockImplementation(() => Promise.reject(expectedError));
        });

        test('should reject', () => {
          return expect(sut(state))
            .rejects
            .toEqual(expectedError);
        });
      });
    });
  });

  describe('given valid input, running sequential', () => {
    const options = {
      do: 'for',
      every: 'thing',
      in: 'first-thing, second-thing',
      exec: 'task',
      sequential: true
    };

    describe('with \'in\' as a comma-separated list', () => {
      beforeEach(() => {
        options.in = 'first-thing, second-thing';
        state = new State(options, Logger);
      });

      test('executes the tasks with each value', () => {
        return sut(state)
          .then(() => {
            expect(task.mock.calls[0][0]).toMatchObject({do: options.exec, thing: options.in.split(',')[0]});
            expect(task.mock.calls[1][0]).toMatchObject({do: options.exec, thing: options.in.split(',')[1]});
          });
      });

      describe('if one step fails', () => {
        const expectedError = new Error('Test error');

        beforeEach(() => {
          task.mockImplementation(() => Promise.reject(expectedError));
        });

        test('should reject', () => {
          return expect(sut(state))
            .rejects
            .toEqual(expectedError);
        });
      });
    });

    describe('with \'in\' as an array', () => {
      beforeEach(() => {
        options.in = ['first-thing', 'second-thing'];
        state = new State(options, Logger);
      });

      test('executes the tasks with each value', () => {
        return sut(state)
          .then(() => {
            expect(task.mock.calls[0][0]).toMatchObject({do: options.exec, thing: options.in[0]});
            expect(task.mock.calls[1][0]).toMatchObject({do: options.exec, thing: options.in[1]});
          });
      });

      describe('if one step fails', () => {
        const expectedError = new Error('Test error');

        beforeEach(() => {
          task.mockImplementation(() => Promise.reject(expectedError));
        });

        test('should reject', () => {
          return expect(sut(state))
            .rejects
            .toEqual(expectedError);
        });
      });
    });
  });
});
