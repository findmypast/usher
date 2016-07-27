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
  const stdout = 'test message';
  const child = {
    exec: sandbox.stub().callsArgWith(2, null, stdout, null)
  };
  const logger = mocks.logger;
  before(function() {
    mockery.registerAllowable('lodash');
    mockery.registerAllowable('bluebird');
    mockery.registerAllowable('./shell');
    mockery.registerAllowable('../lib/errors');

    mockery.registerMock('child_process', child);

    sut = require('./shell');
  });
  describe('given valid input', function() {
    const options = {
      cwd: 'path',
      env: {
        ENV: 'env'
      },
      shell: 'shelly',
      timeout: 0,
      maxBuffer: 200,
      killSignal: 'SIGTERM',
      uid: 1,
      gid: 1
    };
    const state = {
      name: 'shell-test',
      command: 'test command'
    };
    it('executes the command in a shell', function() {
      return sut(state, logger)
        .then(() => expect(child.exec).to.have.been.calledWith(state.command));
    });
    it('logs child stdout and returns it', function() {
      return sut(state, logger)
        .then(output => expect(output).to.equal(stdout))
        .then(() => expect(logger.info).to.have.been.calledWith(state, stdout));
    });
    it('passes in options', function() {
      return sut(_.merge(state, options), logger)
        .then(() => expect(child.exec).to.have.been.calledWith(state.command, options));
    });
  });
});
