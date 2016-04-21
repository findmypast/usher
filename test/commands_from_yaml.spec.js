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

  let tests = [{
      key: 'build',
      cmdArgs: ['version=latest'],
      expected: {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' ')
      }
  }];

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
    it(`should make command for preset ${test.key}`, () => {
      run(test.key, test.cmdArgs, {filepath:filename})
      expect(spawnSyncStub).to.have.been.calledWith(test.expected.executable, test.expected.args);
    }));
});
