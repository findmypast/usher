'use strict';

const State = require('../core/state');
const Promise = require('bluebird');
const Logger = require('../../../test/v2/mock-logger');

describe('tasks/parallel', () => {
  jest.mock('../core/task');
  const task = require('../core/task');

  const sut = require('./parallel');
  let inputState;

  beforeEach(() => {
    task.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('given valid input', () => {
    const options = {
      actions: [
        {
          description: 'a task',
          do: 'mock'
        },
        () => true
      ]
    };
    const inputState = new State(options, Logger);

    test('executes the tasks', () => {
      return sut(inputState)
        .then(() => {
          expect(task.mock.calls[0][0]).toEqual(options.actions[0]);
          expect(task.mock.calls[1][0]).toEqual(options.actions[1]);
        });
    });
    
    describe('if one step fails', () => {
      const expectedError = new Error('Test error');

      beforeEach(() => {
        task.mockImplementation(() => Promise.reject(expectedError));
      });

      test('should reject', () => {
        return expect(sut(inputState))
          .rejects
          .toEqual(expectedError);
      });
    });
  });
});
