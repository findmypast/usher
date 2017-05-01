/* global describe before after beforeEach it expect sandbox mockery mocks _*/
'use strict';

const State = require('../core/state');

describe('tasks/shell', () => {
  const fakeProcessEnv = {blergle: 'yergle'};
  beforeEach(() => {
    sandbox.reset();
    process.env = fakeProcessEnv;
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
  const stdout = 'test message';
  const spawny = sandbox.stub().returns({ on: (code, func) => func(0)});
  const child = {
    exec: sandbox.stub().yields(null, stdout, null),
    spawn: spawny
  };
  const Logger = mocks.Logger;
  before(() => {
    mockery.registerMock('child_process', child);

    sut = require('./shell');
  });
  describe('given valid input', () => {
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
    const existingEnv = Object.assign(fakeProcessEnv, {
      ENV: 'env',
      PYTHONIOENCODING: 'utf-8'
    });

    const expected = {
      cwd: 'path',
      env: existingEnv,
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

    it('executes the command in a shell', () => {
      return sut(state)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command')));
    });
    it('resolves with stdout', () => {
      return sut(state)
        .then(output => expect(output).to.equal(stdout));
    });
    it('passes in options', () => {
      return sut(state)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command'), expected));
    });
    it('passes through existing environment', () => {
      return sut(state)
        .then(() => expect(child.exec).to.have.been.calledWith(state.get('command'), expected));
    });

    it('runs an interactive shell', () => {
      const interactiveState = _.cloneDeep(state);
      interactiveState.set('command', 'do-it copy -f file');
      interactiveState.set('options', {
        interactive: true
      });
      const interactiveExpected = Object.assign({}, expected, { stdio: 'inherit'});

      return sut(interactiveState)
        .then(() => expect(child.spawn).to.have.been.calledWith('do-it', ['copy', '-f', 'file'], interactiveExpected));
    });

    describe('if the command fails', () => {
      const expectedError = new Error('Test error');
      before(() => {
        child.exec.yields(expectedError, stdout, null);
      });
      it('should reject with the error', () => {
        return expect(sut(state)).to.be.rejectedWith(expectedError);
      });
      after(() => {
        child.exec.reset();
      });
    });
  });
});
