/* global describe before after beforeEach it expect sandbox mockery mocks _*/
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
      env: ['ENV=env'],
      shell: 'shelly',
      timeout: 0,
      maxBuffer: 200,
      killSignal: 'SIGTERM',
      uid: 1,
      gid: 1
    };

    const expected = {
      cwd: 'path',
      env: {
        ENV: 'env',
        PYTHONIOENCODING: 'utf-8'
      },
      shell: 'shelly',
      timeout: 0,
      maxBuffer: 200,
      killSignal: 'SIGTERM',
      uid: 1,
      gid: 1
    };

    const state = new State(_.merge({}, {
      name: 'shell-test',
      command: 'test command'
    }, options), Logger);

    it('executes the command in a shell', function() {
      return sut(state)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command')));
    });
    it('resolves with stdout', function() {
      return sut(state)
        .then(output => expect(output).to.equal(stdout));
    });
    it('passes in options', function() {
      return sut(state)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command'), expected));
    });

    describe('if the command fails', function() {
      const expectedError = new Error('Test error');
      before(function() {
        child.exec.yields(expectedError, stdout, null);
      });
      it('should reject with the error', function() {
        return expect(sut(state)).to.be.rejectedWith(expectedError);
      });
      after(function() {
        child.exec.reset();
      });
    });
  });
});
