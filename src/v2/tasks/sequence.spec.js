/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

const State = require('../core/state');

describe('tasks/shell', function() {
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
  const task = sandbox.stub().returns(Promise.resolve());
  const Logger = mocks.Logger;
  before(function() {
    mockery.registerMock('../core/task', task);

    sut = require('./sequence');
  });
  describe('given valid input', function() {
    const options = {
      steps: [
        {
          description: 'a task',
          do: 'mock'
        },
        () => true
      ]
    };
    const state = new State(options, Logger);
    it('executes the tasks in order', function() {
      return sut(state)
        .then(() => {
          expect(task.firstCall).to.have.been.calledWithMatch(options.steps[0]);
          expect(task.secondCall).to.have.been.calledWithMatch(options.steps[1]);
        });
    });
  });
});
