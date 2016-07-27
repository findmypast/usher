/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

beforeEach(function() {
  sandbox.reset();
});
before(function() {
  mockery.enable();
});
after(function() {
  mockery.disable();
});
const loggerMock = mocks.logger;
const id = 'test-id';
const idMock = {
  v4: () => id
};

let sut;
describe('factories/task', function() {
  before(function() {
    mockery.registerMock('uuid', idMock);
    mockery.registerAllowable('lodash');
    mockery.registerAllowable('./task');
    mockery.registerAllowable('../lib/errors');

    sut = require('./task');
  });
  describe('given valid input', function() {
    const mockTask = sandbox.stub();
    const inputState = {
      tasks: {
        mock: (...args) => Promise.try(() => mockTask(...args))
      },
      do: 'mock'
    };
    it('returns a function which calls a task', function() {
      return sut(loggerMock)(inputState)
        .then(() => expect(mockTask).to.have.been.calledWith(inputState, loggerMock));
    });
    it('returns a function which logs task start and end', function() {
      return sut(loggerMock)(inputState)
        .then(() => {
          expect(loggerMock.task.begin).to.have.been.calledWith(id, inputState);
          expect(loggerMock.task.end).to.have.been.calledWith(id);
        });
    });
  });
  describe('when task doesn\'t exist', function() {
    const badState = {do: 'wrong'};
    it('logs error and rejects', function() {
      const error = new errors.TaskNotFoundError(badState.do);
      return expect(sut(loggerMock)(badState)).to.be.rejectedWith(error.message)
      .then(() => {
        expect(loggerMock.error).to.have.been.calledWithMatch(error, badState);
      });
    });
  });
  describe('when task rejects', function() {
    const taskError = new Error('test error');
    const badState = {
      tasks: {
        throws: () => Promise.try(() => {
          throw taskError;
        })
      },
      do: 'throws',
      name: 'test-task'
    };
    it('logs error and rejects', function() {
      const sutError = new errors.TaskFailedError(taskError, badState);
      return expect(sut(loggerMock)(badState, 'test-task')).to.be.rejectedWith(sutError.message)
      .then(() => {
        expect(loggerMock.error).to.have.been.calledWithMatch(sutError, badState);
      });
    });
    it('logs error and resolves if options.ignore_errors is true', function() {
      const state = _.merge({}, badState, {options: {ignore_errors: true}});
      const sutError = new errors.TaskFailedError(taskError, badState);
      return sut(loggerMock)(state, 'test-task')
      .then(() => {
        expect(loggerMock.error).to.have.been.calledWithMatch(sutError, state);
      });
    });
  });
});
