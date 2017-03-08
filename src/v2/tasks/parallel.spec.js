/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

const State = require('../core/state');

describe('tasks/parallel', () => {
  beforeEach(() => {
    sandbox.reset();
  });
  before(() => {
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
  });
  after(() => {
    mockery.deregisterAll();
    mockery.disable();
  });
  let sut;
  const task = sandbox.stub().resolves();
  const Logger = mocks.Logger;
  before(() => {
    mockery.registerMock('../core/task', task);

    sut = require('./parallel');
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
    const state = new State(options, Logger);
    it('executes the tasks', () => {
      return sut(state)
        .then(() => {
          expect(task.firstCall).to.have.been.calledWithMatch(options.actions[0]);
          expect(task.secondCall).to.have.been.calledWithMatch(options.actions[1]);
        });
    });
    describe('if one step fails', () => {
      const expectedError = new Error('Test error');
      before(() => {
        task.onFirstCall().rejects(expectedError);
      });
      it('should reject', () => {
        return expect(sut(state)).to.be.rejectedWith(expectedError);
      });
      after(() => {
        task.onFirstCall().resolves();
      });
    });
  });
});
