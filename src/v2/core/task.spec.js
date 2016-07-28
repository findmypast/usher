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
const State = require('../core/state');
const logger = mocks.logger;
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
        mock: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
      }
    };
    const inputTask = {
      do: 'mock',
      arg: 'test'
    };
    let state;
    let task;
    beforeEach(function() {
      task = Object.create(inputTask);
      state = new State(inputState, logger);
    });
    it('adds an id to the task', function() {
      return sut(task, state)
        .then(() => {
          expect(task.id).to.equal(id);
        });
    });
    it('calls a task with merged state', function() {
      return sut(task, state)
        .then(() => {
          const mergedState = new State(inputState, logger);
          mergedState.push(task);
          expect(mockTask).to.have.been.calledWithMatch(mergedState);
        });
    });
    it('logs task start and end', function() {
      return sut(task, state)
        .then(() => {
          expect(logger.task.begin).to.have.been.calledWith();
          expect(logger.task.end).to.have.been.calledWith();
        });
    });
    it('pops state after completion', function() {
      return sut(task, state)
        .then(() => {
          expect(state).to.deep.equal(new State(inputState, logger));
        });
    });
  });
  describe('when task doesn\'t exist', function() {
    const task = {do: 'wrong'};
    const state = new State({}, logger);
    it('logs error and rejects', function() {
      const error = new errors.TaskNotFoundError(state.do);
      return expect(sut(task, state)).to.be.rejectedWith(error.message)
      .then(() => {
        expect(logger.error).to.have.been.calledWithMatch(error);
      });
    });
  });
  describe('when task rejects', function() {
    const taskError = new Error('test error');
    const state = new State({
      tasks: {
        throws: () => Promise.try(() => {
          throw taskError;
        })
      }
    }, logger);
    const task = {
      do: 'throws'
    };
    it('logs error and rejects', function() {
      const sutError = new errors.TaskFailedError(taskError, state);
      return expect(sut(task, state)).to.be.rejectedWith(sutError.message)
      .then(() => {
        expect(logger.error).to.have.been.calledWithMatch(sutError);
      });
    });
    it('logs error and resolves if options.ignore_errors is true', function() {
      const ignoreErrorsTask = _.merge({}, task, {options: {ignore_errors: true}});
      const sutError = new errors.TaskFailedError(taskError, state);
      return sut(ignoreErrorsTask, state)
      .then(() => {
        expect(logger.error).to.have.been.calledWithMatch(sutError);
      });
    });
  });
});