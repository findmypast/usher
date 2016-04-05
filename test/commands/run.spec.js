"use strict";

const chai      = require('chai');
const expect    = chai.expect;
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');
const rewire    = require('rewire');
chai.use(sinonChai);

var run = rewire('../../src/commands/run');

describe('Command runner', () => {
  let testInput = {
    singleCommand:    ["singleCommand"],
    commandSequence:  ["firstCommand", "secondCommand"],
    emptyCommand:     false
  }
  let spawnSyncStub = sinon.stub().returns({
    status: 0
  });
  let parseStub     = sinon.stub().returns(testInput);
  run.__set__({
    spawnSync:  spawnSyncStub,
    parse:      parseStub
  })

  it('should run a single command in a child process', () => {
    let testCommand = "singleCommand";

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0]);
  });

  it('should run a sequence of commands in child processes', () => {
    let testCommand = "commandSequence";

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0]);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][1]);
  });
});
