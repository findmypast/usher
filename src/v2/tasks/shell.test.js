'use strict';

const State = require('../core/state');
const Logger = require('../../../test/v2/mock-logger');
const _ = require('lodash');

describe('tasks/shell', () => {
  jest.mock('child_process');
  const child = require('child_process');
  const fakeProcessEnv = {blergle: 'yergle'};
  beforeEach(() => {
    process.env = fakeProcessEnv;
  });

  const stdout = 'test message';
  const spawny = jest.fn(() => {on: (code, func) => func(0)});
  child.exec = jest.fn((a,b,c) => c(null, stdout, null));
  child.spawn.mockImplementation(() => {
    return {on: (code, func) => func(0)};
  });

  const sut = require('./shell');

  afterEach(() => {
    jest.clearAllMocks();
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
      PYTHONIOENCODING: 'utf-8',
      FORCE_COLOR: true,
      NPM_CONFIG_COLOR: 'always'
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

    test('executes the command in a shell', () => {
      return sut(state)
        .then(() => expect(child.exec).toHaveBeenCalled());
    });
    test('resolves with stdout', () => {
      return sut(state)
        .then(output => expect(output).toEqual(stdout));
    });
    test('passes in options', () => {
      return sut(state)
        .then(() => expect(child.exec.mock.calls[0][1]).toEqual(expected));
    });
    test('passes through existing environment', () => {
      return sut(state)
        .then(() => expect(child.exec.mock.calls[0][1]).toEqual(expected));
    });
    test('runs an interactive shell', () => {
      const interactiveState = _.cloneDeep(state);
      interactiveState.set('command', 'do-it copy -f file');
      interactiveState.set('options', {
        interactive: true
      });
      const interactiveExpected = Object.assign({}, expected, { stdio: 'inherit'});

      return sut(interactiveState)
        .then(() => expect(child.spawn).toHaveBeenCalledWith('do-it', ['copy', '-f', 'file'], interactiveExpected));
    });

    describe('if the command fails', () => {
      const expectedError = new Error('Test error');
      beforeEach(() => {
        child.exec.mockImplementation((a, b, c) => {
          return c(expectedError, stdout, null);
        });
      });

      test('should reject with the error', () => {
        return expect(sut(state))
          .rejects
          .toEqual(expectedError);
      });
    });
  });
});
