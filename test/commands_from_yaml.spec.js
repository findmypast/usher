"use strict";

const logger    = require('winston');
logger.level = 4;
const chai      = require('chai');
const expect    = chai.expect;
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');
const rewire    = require('rewire');

let run = rewire('../src/run');
chai.use(sinonChai);

describe('Given a YAML file run command execution', () => {
  let filename = 'test/test.usher.yml';

  let tests = [
    {
      key: 'build',
      cmdArgs: ['version=latest'],
      expected: {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' '),
          options: {}
      }
    },
    {
      key: 'build',
      cmdArgs: ['version=latest', 'image=usher-test'],
      expected: {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/usher-test:latest .'.split(' '),
          options: {}
      }
    },
    {
      key: 'publish',
      cmdArgs: ['version=latest', 'user=neil', 'password=password', 'email=ncrawford@findmypast.com'],
      expected: {
          executable: 'docker',
          args: 'run --name usher-publisher --rm docker-registry.dun.fh/findmypast/usher:latest npm run publish-to-npm'.split(' '),
          options: {
            env: {
              NPM_USER: 'neil',
              NPM_PASSWORD: 'password',
              NPM_EMAIL: 'ncrawford@findmypast.com'
            }
          }
      }
    }
  ];

  let spawnSyncStub = sinon.stub();
  run.__set__({
    spawnSync:  spawnSyncStub
  });

  spawnSyncStub.returns({
    status: 0
  });

  beforeEach(() => {
    spawnSyncStub.reset();
  })

  tests.forEach( test =>
    it(`should execute task ${test.key} with command line vars ${test.cmdArgs.join(' ')}`, () => {
      run(test.key, test.cmdArgs, {filepath:filename})
      expect(spawnSyncStub).to.have.been.calledWith(test.expected.executable, test.expected.args, test.expected.options);
    }));
});
