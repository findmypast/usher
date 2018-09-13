'use strict';

const _ = require('lodash');
const errors = require('../lib/errors');
const Logger = require('../../../test/v2/mock-logger');
const path = require('path');

describe('commands/setup', () => {
  const parse = {
    call: require('./parse')
  };
  const mockSharedTasks = parse.call('./test/v2/mock-shared-tasks.yml');
  const parseSpy = jest.spyOn(parse, 'call');
  const usherV2TestFile = 'test/v2/test.usher.yml';
  const usherFileInfo = path.parse(usherV2TestFile);

  jest.mock('child-process-promise');
  const childProcessPromise = require('child-process-promise');
  childProcessPromise.exec = jest.fn();
  childProcessPromise.exec.mockImplementation((a) => {
    return Promise.resolve(a);
  });

  const sut = require('./setup');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('given valid input', () => {
    var result;
    const inputConfig = _.merge({}, parse.call(usherV2TestFile));

    beforeEach(() => {
      return sut(inputConfig, Logger, usherFileInfo.dir, parse.call)
      .then(value => {
        result = value;
      });
    });

    test('puts vars into initial state', () => {
      expect(result.get('base_service_name'))
        .toEqual(inputConfig.vars.base_service_name);
    });

    test('imports vars from include files', () => {
      expect(result.get('some_mock_var'))
        .toEqual(mockSharedTasks.vars.some_mock_var);
    });

    test('imported variables from included files do not overwrite existing variables', () => {
      expect(result.get('some_mock_var_that_clashes'))
        .toEqual("original-value");
    });

    test('puts tasks into initial state', () => {
      expect(result.get('tasks.build'))
        .toEqual(inputConfig.tasks.build);
    });

    test('puts default tasks into initial state', () => {
      expect(result.get('tasks.shell'))
        .toEqual(require('../tasks').shell);
    });

    test('installs includes to cache', () => {
      expect(parseSpy)
        .toBeCalledWith(`test/v2/mock-shared-tasks.yml`);
    });

    test('merges required include to tasks', () => {
      expect(result.get('tasks.global.tasks.mock_task'))
        .toEqual(mockSharedTasks.tasks.mock_task);

      expect(result.get('tasks.global.tasks.another_mock_task'))
        .toEqual(mockSharedTasks.tasks.another_mock_task);
    });
  });

  describe('given invalid input', () => {
    let inputConfig;

    beforeEach(() => {
      inputConfig = _.merge({}, parse.call(usherV2TestFile));
    });

    describe('if vars is not an object', () => {
      beforeEach(() => {
        inputConfig.vars = ['wrong'];
      });

      test('rejects', () => {
        return expect(sut(inputConfig, Logger))
          .rejects
          .toEqual(new errors.InvalidConfigError('vars not a valid object'));
      });
    });

    describe('if tasks is not an object', () => {
      beforeEach(() => {
        inputConfig.tasks = ['wrong'];
      });

      test('rejects', () => {
        return expect(sut(inputConfig, Logger))
          .rejects
          .toEqual(new errors.InvalidConfigError('tasks not a valid object'));
      });
    });

    describe('if include is not an array', () => {
      beforeEach(() => {
        inputConfig.include = 1;
      });

      test('rejects', () => {
        return expect(sut(inputConfig, Logger))
          .rejects
          .toEqual(new errors.InvalidConfigError('include must be an array'));
      });
    });

    describe('if an include is lacking from/import', () => {
      beforeEach(() => {
        inputConfig.include = [
          {
            not_from: 'mock-input'
          }
        ];
      });

      test('rejects', () => {
        return expect(sut(inputConfig, Logger))
          .rejects
          .toEqual(new errors.InvalidConfigError('includes must all have "from"'));
      });
    });

    describe('if a task is lacking do', () => {
      beforeEach(() => {
        inputConfig.tasks.bad_task = [
          {
            description: 'wrong'
          }
        ];
      });

      test('rejects indicating which task is wrong', () => {
        return expect(sut(inputConfig, Logger))
          .rejects
          .toEqual(new errors.InvalidConfigError('task bad_task missing "do" property'));
      });
    });
  });
});
