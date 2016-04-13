"use strict";

const logger    = require('winston');
logger.level = 0;
const chai      = require('chai');
const expect    = chai.expect;
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');
const rewire    = require('rewire');

let run = rewire('../../src/commands/run');
chai.use(sinonChai);

describe('Given a YAML file run command execution', () => {
  let filename = 'test/integration/test.usher.yml';

  let tests = [
    {
      key: 'fast_tests',
      cmd_args: '',
      expected: {executable: 'npm', args: ['test']}
    },
    {
      key: 'build_prod',
      cmd_args: ['version=1'],
      expected: {executable: 'docker', args: ['build', '--force-rm',
       '-t', 'docker-registry.dun.fh/findmypast/usher:latest',
       '-t', 'docker-registry.dun.fh/findmypast/usher:1', '.']}
    },
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
    it(`should make command for preset ${test.key}`, () => {
      run(test.key, test.cmd_args, filename)
      expect(spawnSyncStub).to.have.been.calledWith(test.expected.executable, test.expected.args);
    }));
});
