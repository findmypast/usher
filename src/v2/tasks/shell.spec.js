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
  const stdout = 'test message';
  const child = {
    exec: sandbox.stub().yields(null, stdout, null)
  };
  const Logger = mocks.Logger;
  before(function() {
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
    const state = new State({
      name: 'shell-test',
      command: 'test command'
    }, Logger);
    it('executes the command in a shell', function() {
      return sut(state, Logger)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command')));
    });
    it('logs child stdout and returns it', function() {
      return sut(state, Logger)
        .then(output => expect(output).to.equal(stdout))
        .then(() => expect(Logger.info).to.have.been.calledWith(stdout));
    });
    it('passes in options', function() {
      return sut(_.merge(state, options), Logger)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command'), options));
    });
  });
});
