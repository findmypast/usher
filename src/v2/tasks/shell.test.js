'use strict';

const State = require('../core/state');
const Logger = require('../../../test/v2/mock-logger');
const _ = require('lodash');

describe('tasks/shell', () => {
  const fakeProcessEnv = {blergle: 'yergle'};
  beforeEach(() => {
    process.env = fakeProcessEnv;
  });

  const stdout = 'test message';

  jest.mock('child-process-promise');
  const childProcessPromise = require('child-process-promise');
  childProcessPromise.spawn = jest.fn();
  childProcessPromise.spawn.mockImplementation(() => {
    var promise = Promise.resolve('test message');
    promise.childProcess = {};
    promise.childProcess.on = jest.fn();
    promise.childProcess.stdout = jest.fn();
    promise.childProcess.stderr = jest.fn();
    promise.childProcess.stdout.pipe = jest.fn();
    promise.childProcess.stdout.on = jest.fn();
    promise.childProcess.stdout.on.mockImplementation((event, callback) => {
      callback(stdout);
    });
    promise.childProcess.stderr.pipe = jest.fn();
    promise.childProcess.stderr.on = jest.fn();
    return promise;
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
      shell: true,
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
        .then(() => {
          expect(childProcessPromise.spawn).toHaveBeenCalled();
          expect(childProcessPromise.spawn.mock.calls[0][2]).toMatchObject({
            shell: true
          });
        });
    });
    test('resolves with stdout', () => {
      return sut(state)
        .then(output => expect(output).toEqual(stdout));
    });
    test('passes in options', () => {
      return sut(state)
        .then(() => expect(childProcessPromise.spawn.mock.calls[0][2]).toMatchObject(expected));
    });
    test('passes through existing environment', () => {
      return sut(state)
        .then(() => expect(childProcessPromise.spawn.mock.calls[0][2].env).toMatchObject(existingEnv));
    });

    describe('if the command fails', () => {
      const expectedError = new Error('Test error');
      beforeEach(() => {
        childProcessPromise.spawn.mockImplementation(() => {
          var promise = Promise.reject(expectedError);
          promise.childProcess = {};
          promise.childProcess.on = jest.fn();
          promise.childProcess.stdout = jest.fn();
          promise.childProcess.stderr = jest.fn();
          promise.childProcess.stdout.pipe = jest.fn();
          promise.childProcess.stdout.on = jest.fn();
          promise.childProcess.stderr.pipe = jest.fn();
          promise.childProcess.stderr.on = jest.fn();
          return promise;
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
