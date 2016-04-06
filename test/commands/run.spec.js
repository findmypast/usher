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
    singleCommand:    [ { command: "singleCommand",  settings: {} } ],
    retryCommand:     [ { command: "singleCommand",
                          settings: {
                            retry: {
                              attempts: 5,
                              delay:    10
                            }
                          } } ],
    multipleArgs:     [ { command: "run me here",    settings: {} } ],
    commandSequence:  [ { command: "firstCommand",   settings: {} },
                        { command: "secondCommand",  settings: {} } ],
    acceptableErrors: [ { command: "firstCommand",   settings: { ignore_errors: [5] } },
                        { command: "secondCommand",  settings: { ignore_errors: [5] } } ],
    emptyCommand:     false
  }
  let spawnSyncStub = sinon.stub()
  let parseStub     = sinon.stub().returns(testInput);
  run.__set__({
    spawnSync:  spawnSyncStub,
    parse:      parseStub
  })
  beforeEach(() => spawnSyncStub.reset())

  it('should run a single command in a child process', () => {
    let testCommand = "singleCommand";
    spawnSyncStub.returns({
      status: 0
    });

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0].command);
  });

  it('should retry commands if they fail and given retry settings', () => {
    let testCommand = "retryCommand";
    spawnSyncStub.returns({
      status: 1,
      error: new Error("Test Error")
    })

    expect(() => run(testCommand)).to.throw();
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0].command);
    expect(spawnSyncStub).to.have.callCount(testInput[testCommand][0].settings.retry.attempts);
  });

  it('should run a command with multiple args in a child process', () => {
    let testCommand = "multipleArgs";
    spawnSyncStub.returns({
      status: 0
    });
    let expectedCommandWithArgs = testInput[testCommand][0].command.split(" ");
    let expectedCommand = _.head(expectedCommandWithArgs);
    let expectedArgs = _.tail(expectedCommandWithArgs);

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(expectedCommand, expectedArgs);
  });

  it('should run a sequence of commands in child processes', () => {
    let testCommand = "commandSequence";
    spawnSyncStub.returns({
      status: 0
    });

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0].command);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][1].command);
  });

  it('should not run commands after a command errors', () => {
    let testCommand = "commandSequence";
    spawnSyncStub.returns({
      status: 1,
      error: new Error("Test Error")
    })

    expect(() => run(testCommand)).to.throw();
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0].command);
    expect(spawnSyncStub).to.not.have.been.calledWith(testInput[testCommand][1].command);
  });

  it('should tolerate errors with accepted error codes with the right option', () => {
    let testCommand = "acceptableErrors";
    spawnSyncStub.returns({
      status: 5,
      error: new Error("Test Error")
    })

    run(testCommand);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][0].command);
    expect(spawnSyncStub).to.have.been.calledWith(testInput[testCommand][1].command);
  });

  it('should not run any commands when given invalid preset', () => {
    let testCommand = "emptyCommand";
    spawnSyncStub.returns({
      status: 0
    });

    run(testCommand);
    expect(spawnSyncStub).to.not.have.been.called;
  });

  it('should not run any commands when given missing preset', () => {
    let testCommand = "notInList";
    spawnSyncStub.returns({
      status: 0
    });

    run(testCommand);
    expect(spawnSyncStub).to.not.have.been.called;
  });
});
