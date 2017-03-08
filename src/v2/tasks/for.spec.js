/* global describe context before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

const State = require('../core/state');

describe('tasks/for', () => {
  context('run parallel', () => {
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

      sut = require('./for');
    });
    describe('given valid input', () => {
      const options = {
        do: 'for',
        every: 'thing',
        in: 'first-thing, second-thing',
        exec: 'task'
      };
      const state = new State(options, Logger);
      it('executes the tasks with each value', () => {
        return sut(state)
          .then(() => {
            expect(task.firstCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in.split(',')[0]});
            expect(task.secondCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in.split(',')[1]});
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
    describe('given valid input, and in as an array', () => {
      const options = {
        do: 'for',
        every: 'thing',
        in: ['first-thing', 'second-thing'],
        exec: 'task'
      };
      const state = new State(options, Logger);
      it('executes the tasks with each value', () => {
        return sut(state)
          .then(() => {
            expect(task.firstCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in[0]});
            expect(task.secondCall).to.have.been.calledWithMatch({do: options.exec, thing: options.in[1]});
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
});
