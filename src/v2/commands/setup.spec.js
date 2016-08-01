/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';
const uuid = require('uuid').v4;

describe('factories/task', function() {
  let sut;
  let result;
  const logger = mocks.logger;
  const execMock = sandbox.stub().yields();
  const mockImport = {
    mock1: sandbox.stub(),
    mock2: sandbox.stub()
  };
  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable();
    mockery.warnOnUnregistered(false);
    mockery.registerMock('child_process', { exec: execMock });
    mockery.registerMock('mock-import', mockImport);

    sut = require('./setup');
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  describe('given valid input', function() {
    const input = {
      vars: {
        test_var: uuid()
      },
      include: [
        {
          from: 'mock-import',
          import: ['mock1', 'mock2']
        },
        {
          from: 'mock-import',
          import: ['mock1 as other_mock']
        }
      ],
      tasks: {
        test: {
          description: uuid(),
          do: 'other_mock',
          arg: 'test-var'
        }
      }
    };
    beforeEach(function() {
      return sut(input, logger)
      .then(value => {
        result = value;
      });
    });
    it('puts vars into initial state', function() {
      expect(result.get('test_var')).to.equal(input.vars.test_var);
    });
    it('puts tasks into initial state', function() {
      expect(result.get('tasks.test')).to.deep.equal(input.tasks.test);
    });
    it('installs includes to cache', function() {
      expect(execMock).to.have.been.calledWith('npm install mock-import');
    });
    it('merges required include to tasks', function() {
      expect(result.get('tasks.mock1')).to.equal(mockImport.mock1);
      expect(result.get('tasks.mock2')).to.equal(mockImport.mock2);
      expect(result.get('tasks.other_mock')).to.equal(mockImport.mock1);
    });
  });
});
