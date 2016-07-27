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

let sut;
describe('tasks/shell', function() {
  const child_process = {
    exec: sandbox.stub().callsArg(2)
  };
  const logger = mocks.logger;
  before(function() {
    mockery.registerAllowable('lodash');
    mockery.registerAllowable('bluebird');
    mockery.registerAllowable('./shell');
    mockery.registerAllowable('../lib/errors');

    mockery.registerMock('child_process', child_process);

    sut = require('./shell');
  });
  describe('given valid input', function() {
    const state = {
      name: 'shell-test',
      command: 'test command'
    };
    it('executes the command in a shell', function() {
      return sut(state, logger)
        .then(expect(child_process.exec).to.have.been.calledWith(state.command));
    });
  });
});
