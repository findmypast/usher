"use strict";

const logger    = require('winston');
logger.level = 'none';
const chai      = require('chai');
const expect    = chai.expect;
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');
const rewire    = require('rewire');
const _         = require('lodash');

let taskRunner = rewire('../src/modules/task-runner');
let run = rewire('../src/run');
chai.use(sinonChai);

describe('Given a YAML file run command execution', () => {
  let filename = 'test/test.usher.yml';

  let tests = [
    {
      key: 'build',
      cmdArgs: ['version=latest'],
      expected: [{
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' '),
          options: {
            stdio: 'inherit'
          }
      }]
    },
    {
      key: 'build',
      cmdArgs: ['version=latest', 'image=usher-test'],
      expected: [{
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/usher-test:latest .'.split(' '),
          options: {
            stdio: 'inherit'
          }
      }]
    },
    {
      key: 'publish',
      cmdArgs: ['version=latest', 'user=neil', 'password=password', 'email=ncrawford@findmypast.com'],
      expected: [{
          executable: 'docker',
          args: 'run --name usher-publisher --rm docker-registry.dun.fh/findmypast/usher:latest npm run publish-to-npm'.split(' '),
          options: {
            env: {
              NPM_USER: 'neil',
              NPM_PASSWORD: 'password',
              NPM_EMAIL: 'ncrawford@findmypast.com'
            },
            stdio: 'inherit'
          }
      }]
    },
    {
      key: 'build_seq',
      cmdArgs: ['version=latest'],
      expected: [
      {
        executable: 'docker',
        args: 'rm -f findmypast/usher-local'.split(' '),
        options: {
          stdio: 'inherit'
        }
      },
      {
        executable: 'docker',
        args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' '),
        options: {
          stdio: 'inherit'
        }
      }]
    },
    {
      key: 'build_seq_ignore_errors',
      cmdArgs: ['version=latest'],
      expected: [
      {
        executable: 'docker',
        args: 'rm -f findmypast/usher-local'.split(' '),
        options: {
          stdio: 'inherit'
        }
      },
      {
        executable: 'docker',
        args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' '),
        options: {
          stdio: 'inherit'
        }
      }]
    }
  ];

  let spawnSyncStub = sinon.stub();
  taskRunner.__set__({
    spawnSync:  spawnSyncStub
  });

  run.__set__({
    TaskRunner: taskRunner
  });

  beforeEach(() => {
    spawnSyncStub.reset();
    spawnSyncStub.returns({
      status: 0});
  })

  tests.forEach( test =>
    it(`should execute task ${test.key} with command line vars ${test.cmdArgs.join(' ')}`, () => {
      run(test.key, test.cmdArgs, {filepath:filename})
      _.map(test.expected, expected => {
        expect(spawnSyncStub).to.have.been.calledWith(expected.executable, expected.args, expected.options);
      })
    }));

  it(`Should not continue to execute a sequence of commands when an error is returned`, ()=> {
    spawnSyncStub.returns({
      status: 1,
      error: new Error('Test error!')
    });

    const test = _.find(tests, {key: 'build_seq'});
    const expected = test.expected[0];

    run(test.key, test.cmdArgs, {filepath:filename});
    expect(spawnSyncStub).to.have.been.calledWith(expected.executable, expected.args, expected.options);
    expect(spawnSyncStub).to.have.been.calledOnce;
  })

  it(`Should continue to execute a sequence of commands when an error is returned on a command with ignore_errors: true`, ()=> {
    spawnSyncStub.returns({
      status: 1,
      error: new Error('Test error!')
    });

    let test = _.find(tests, {key: 'build_seq_ignore_errors'});

    run(test.key, test.cmdArgs, {filepath:filename});
    _.map(test.expected, expected => {
      expect(spawnSyncStub).to.have.been.calledWith(expected.executable, expected.args, expected.options);
    })
  })

  it ('Should save the result of a command to a variable', () => {
    const expectedDeployTarget = 'green';

    const test = {
      key: 'pass_value_to_next_command',
      cmdArgs: ['version=latest'],
      expected: [
      {
        executable: 'twoface',
        args: '-H consul.dun.fh -b blue -g green peek'.split(' '),
        options: {
          stdio: 'inherit'
        }
      },
      {
        executable: 'docker',
        args: `-H consul.dun.fh run --name ${expectedDeployTarget} --rm docker-registry.dun.fh/findmypast/usher:latest`.split(' '),
        options: {
          stdio: 'inherit'
        }
      }]
    };

    spawnSyncStub.returns({
      status: 0,
      stdout: expectedDeployTarget
    });

    run(test.key, test.cmdArgs, {filepath:filename});
    _.map(test.expected, expected => {
      expect(spawnSyncStub).to.have.been.calledWith(expected.executable, expected.args, expected.options);
    });
  })
});
