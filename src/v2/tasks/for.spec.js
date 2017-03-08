/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

const State = require('../core/state');

describe('tasks/for', function() {
  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  let sut;
  const task = sandbox.stub().resolves();
  const Logger = mocks.Logger;
  before(function() {
    mockery.registerMock('../core/task', task);

    sut = require('./for');
  });
  describe('given valid input', function() {
    const options = {
      do: 'for',
      every: 'thing',
      in: 'first-thing, second-thing',
      exec: 'task'
    };
    const state = new State(options, Logger);
    it('executes the tasks with each value', function() {
      return sut(state)
        .then(() => {
          expect(task.firstCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in.split(',')[0]});
          expect(task.secondCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in.split(',')[1]});
        });
    });
    describe('if one step fails', function() {
      const expectedError = new Error('Test error');
      before(function() {
        task.onFirstCall().rejects(expectedError);
      });
      it('should reject', function() {
        return expect(sut(state)).to.be.rejectedWith(expectedError);
      });
      after(function() {
        task.onFirstCall().resolves();
      });
    });
  });
  describe('given valid input, and in as an array', function() {
    const options = {
      do: 'for',
      every: 'thing',
      in: ['first-thing', 'second-thing'],
      exec: 'task'
    };
    const state = new State(options, Logger);
    it('executes the tasks with each value', function() {
      return sut(state)
        .then(() => {
          expect(task.firstCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in[0]});
          expect(task.secondCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in[1]});
        });
    });
    describe('if one step fails', function() {
      const expectedError = new Error('Test error');
      before(function() {
        task.onFirstCall().rejects(expectedError);
      });
      it('should reject', function() {
        return expect(sut(state)).to.be.rejectedWith(expectedError);
      });
      after(function() {
        task.onFirstCall().resolves();
      });
    });
  });
});
