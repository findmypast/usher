"use strict";

const _         = require('lodash');
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
    multipleArgs:     ["run me here"],
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
  beforeEach(() => spawnSyncStub.reset())

  it('should run a single command in a child process', () => {
    let testCommand = "singleCommand";

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0]);
  });

  it('should run a command with multiple args in a child process', () => {
    let testCommand = "multipleArgs";
    let expectedCommandWithArgs = testInput[testCommand][0].split(" ");
    let expectedCommand = _.head(expectedCommandWithArgs);
    let expectedArgs = _.tail(expectedCommandWithArgs);

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(expectedCommand, expectedArgs);
  });

  it('should run a sequence of commands in child processes', () => {
    let testCommand = "commandSequence";

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0]);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][1]);
  });

  it('should not run commands after a command errors', () => {
    let testCommand = "commandSequence";
    spawnSyncStub.returns({
      status: 1,
      error: new Error("Test Error")
    })

    expect(() => run(testCommand)).to.throw();
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0]);
    expect(spawnSyncStub).to.not.have.been.calledWith(testInput[testCommand][1]);
  });

  it('should not run any commands when given invalid preset', () => {
    let testCommand = "emptyCommand";

    run(testCommand);
    expect(spawnSyncStub).to.not.have.been.called;
  });

  it('should not run any commands when given missing preset', () => {
    let testCommand = "notInList";

    run(testCommand);
    expect(spawnSyncStub).to.not.have.been.called;
  });
});
