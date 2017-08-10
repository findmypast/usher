'use strict';

const State = require('../core/state');
const Promise = require('bluebird');
const Logger = require('../../../test/v2/mock-logger');

describe('tasks/sequence', () => {
  jest.mock('../core/task');
  const task = require('../core/task');

  const sut = require('./sequence');
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
          do: 'first-thing'
        },
        {
          do: 'second-thing'
        }
      ]
    };
    const state = new State(options, Logger);

    test('executes the tasks in order', () => {
      return sut(state)
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

      test('should not execute the next step', () => {
        return expect(sut(state))
          .rejects
          .toEqual(expectedError)
          .then(() => {
            expect(task).not.toHaveBeenCalledWith(options.actions[1]);
          });
      });
    });
  });
});
