/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';
const uuid = require('uuid').v4;

describe('commands/setup', function() {
  let sut;
  let result;
  let input;
  const validInput = {
    vars: {
      test_var: uuid()
    },
    include: [
      {
        from: 'mockInclude',
        name: 'mockInclude',
        import: ['mock1 as aliasMock1', 'mock2']
      },
      {
        from: 'bastion.yml',
        name: 'bastion as ci',
        import: ['create_project', 'create_parameter']
      }
    ],
    tasks: {
      test: {
        description: uuid(),
        do: 'other_mock',
        arg: 'test-var'
      },
      teamcity: {
        tasks: {
          create_project: {
            description: 'Create a TeamCity project and associated configurations',
            'do': 'shell',
            command: 'bastion create microservice test_service service_description'
          },
          create_parameter: {
            description: 'Adds a parameter to a TeamCity project',
            'do': 'shell',
            command: 'bastion parameter test_service build_id parameter_name secret_key_base -p'
          }
        }
      }
    }
  };

  function bastionYmlParseMock() {
    return {
      tasks: {
        ci: {
          create_project: {},
          create_parameter: {}
        }
      }
    };
  }

  const Logger = mocks.Logger;
  const execMock = sandbox.stub().yields();
  const mockImport = {
    aliasMock1: {
      clean_up: 'Test task name'
    },
    mock2: {
      clean_up: 'Test task name 2'
    }
  };

  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.registerMock('child_process', { exec: execMock });
    mockery.registerMock('mockInclude', mockImport);
    mockery.registerMock('./parse', bastionYmlParseMock);
    mockery.registerMock('../lib/errors', errors);

    sut = require('./setup');
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  describe('given valid input', function() {
    before(function() {
      input = _.cloneDeep(validInput);
    });
    beforeEach(function() {
      return sut(input, Logger)
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
    it('puts child tasks into initial state', function() {
      expect(result.get('tasks.teamcity')).to.deep.equal(input.tasks.teamcity);
    });
    it('puts default tasks into initial state', function() {
      expect(result.get('tasks.shell')).to.deep.equal(require('../tasks').shell);
    });
    it('installs includes to cache', function() {
      expect(execMock).to.have.been.calledWith('npm install mockInclude');
    });
    it('merges required include to tasks', function() {
      expect(result.get('tasks.mockInclude.tasks.mock2').tasks).to.deep.equal(mockImport.mock2);
      expect(result.get('tasks.mockInclude.tasks.aliasMock1').tasks).to.deep.equal(mockImport.aliasMock1);
    });
  });
  describe('if vars is not an object', function() {
    before(function() {
      input = _.cloneDeep(validInput);
      input.vars = ['wrong'];
    });
    it('rejects', function() {
      return expect(sut(input, Logger)).to.be.rejectedWith(errors.InvalidConfigError);
    });
  });
  describe('if tasks is not an object', function() {
    before(function() {
      input = _.cloneDeep(validInput);
      input.tasks = ['wrong'];
    });
    it('rejects', function() {
      return expect(sut(input, Logger)).to.be.rejectedWith(errors.InvalidConfigError);
    });
  });
  describe('if include is not an array', function() {
    before(function() {
      input = _.cloneDeep(validInput);
      input.include = validInput.include[0];
    });
    it('rejects', function() {
      return expect(sut(input, Logger)).to.be.rejectedWith(errors.InvalidConfigError);
    });
  });
  describe('if an include is lacking from/import', function() {
    before(function() {
      input = _.cloneDeep(validInput);
      input.include = [
        {
          not_from: 'mock-input'
        }
      ];
    });
    it('rejects', function() {
      return expect(sut(input, Logger)).to.be.rejectedWith(errors.InvalidConfigError);
    });
  });
  describe('if a task is lacking do', function() {
    before(function() {
      input = _.cloneDeep(validInput);
      input.tasks.bad_task = [
        {
          description: 'wrong'
        }
      ];
    });
    it('rejects indicating which task is wrong', function() {
      return expect(sut(input, Logger)).to.be.rejectedWith(errors.InvalidConfigError, /bad_task/);
    });
  });
});
