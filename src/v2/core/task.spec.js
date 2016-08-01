/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

describe('core/task', function() {
  const State = require('../core/state');
  const logger = mocks.logger;
  const id = 'test-id';
  const idMock = {
    v4: () => id
  };
  let sut;
  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable();
    mockery.warnOnUnregistered(false);

    mockery.registerMock('uuid', idMock);
    sut = require('./task');
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  describe('given valid input', function() {
    const output = 'test-output';
    const mockTask = sandbox.stub().returns(output);
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
      task = _.cloneDeep(inputTask);
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
    it('adds output to parent state if options.register is set', function() {
      const refName = 'registered';
      const registerTask = _.merge(task, {options: {register: refName}});
      return sut(registerTask, state)
        .then(() => {
          expect(state.get(refName)).to.deep.equal(output);
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
    const mockTask = sandbox.stub().throws(taskError);
    let task = {
      do: 'throws'
    };
    const inputState = {
      tasks: {
        throws: (state) => Promise.try(() => mockTask(_.cloneDeep(state)))
      }
    };
    let state;
    beforeEach(function() {
      state = new State(inputState, logger);
    });
    it('logs error and rejects', function() {
      const sutError = new errors.TaskFailedError(taskError, state);
      return expect(sut(_.cloneDeep(task), state)).to.be.rejectedWith(sutError.message)
      .then(() => {
        expect(logger.task.fail).to.have.been.calledWithMatch(sutError);
      });
    });
    it('logs error and resolves if options.ignore_errors is true', function() {
      const ignoreErrorsTask = _.merge({}, task, {options: {ignore_errors: true}});
      const sutError = new errors.TaskFailedError(taskError, state);
      return sut(_.cloneDeep(ignoreErrorsTask), state)
      .then(() => {
        expect(logger.task.fail).to.have.been.calledWithMatch(sutError);
      });
    });
    it('retries the task 2 times if options.retry.retries = 2', function() {
      const retries = 2;
      const retryTask = _.merge({}, task, {options: {retry: {retries: retries, minTimeout: 5}}});
      const sutError = new errors.TaskFailedError(taskError, state);
      return expect(sut(_.cloneDeep(retryTask), state)).to.be.rejectedWith(sutError.message)
      .then(() => {
        expect(mockTask.callCount).to.equal(3);
      });
    });
  });
});
