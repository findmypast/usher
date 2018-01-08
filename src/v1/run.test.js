'use strict';

const logger = require('winston');
logger.level = 'none';
const _ = require('lodash');

describe('Given a YAML file run command execution', () => {
  let filename = 'test/v1/test.usher.yml';

  let tasks = [
    {
      key: 'build_quotes',
      cmdArgs: [],
      expected: [{
        executable: 'hello',
        args: [
          'world', 'hard rock', 'planet', 'rock', 'where rock lives!', 'docker-registry.dun.fh/findmypast/usher:latest'
        ]
      }]
    },
    {
      key: 'build',
      cmdArgs: ['version=latest'],
      expected: [{
        executable: 'docker',
        args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' ')
      }]
    },
    {
      key: 'build',
      cmdArgs: ['version=latest', 'image=usher-test'],
      expected: [{
        executable: 'docker',
        args: 'build --force-rm -t docker-registry.dun.fh/usher-test:latest .'.split(' ')
      }]
    },
    {
      key: 'publish',
      cmdArgs: ['version=latest', 'user=neil', 'password=password', 'email=ncrawford@findmypast.com'],
      expected: [{
        executable: 'docker',
        args: 'run --name usher-publisher --rm docker-registry.dun.fh/findmypast/usher:latest npm run publish-to-npm'.split(' '),
        options: {
          env: _.merge({
            NPM_USER: 'neil',
            NPM_PASSWORD: 'password',
            NPM_EMAIL: 'ncrawford@findmypast.com'
          }, process.env),
          stdio: [process.stdin, process.stdout, process.stderr]
        }
      }]
    },
    {
      key: 'build_seq',
      cmdArgs: ['version=latest'],
      expected: [
        {
          executable: 'docker',
          args: 'rm -f findmypast/usher-local'.split(' ')
        },
        {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' ')
        }]
    },
    {
      key: 'build_seq_ignore_errors',
      cmdArgs: ['version=latest'],
      expected: [
        {
          executable: 'docker',
          args: 'rm -f findmypast/usher-local'.split(' ')
        },
        {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/findmypast/usher:latest .'.split(' ')
        }]
    },
    {
      key: 'run_task',
      cmdArgs: ['version=latest'],
      expected: [{
        executable: 'docker',
        args: 'build --force-rm -t docker-registry.dun.fh/some_image:latest .'.split(' ')
      }]
    },
    {
      key: 'run_many_tasks',
      cmdArgs: ['version=latest'],
      expected: [
        {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/image01:latest .'.split(' ')
        },
        {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/image02:latest .'.split(' ')
        }
      ]
    },
    {
      key: 'run_many_tasks_with_vars',
      cmdArgs: [],
      expected: [
        {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/image01:latest .'.split(' ')
        },
        {
          executable: 'docker',
          args: 'build --force-rm -t docker-registry.dun.fh/image02:latest .'.split(' ')
        }
      ]
    },
    {
      key: 'run_task_using_a_task',
      cmdArgs: ['version=latest'],
      expected: [{
        executable: 'docker',
        args: 'build --force-rm -t docker-registry.dun.fh/some_image:latest .'.split(' ')
      }]
    }
  ];

  jest.mock('npm-run');
  const npmRun = require('npm-run')
  npmRun.spawnSync = jest.fn();

  beforeEach(() => {
    npmRun.spawnSync.mockImplementation(() => {
      return {status: 0};
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  const run = require('./run');
  test('execution uses cmd args', () => {
    for (var i = 0; i < tasks.length; ) {
      run(tasks[i].key, tasks[i].cmdArgs, {file: filename});
      _.forEach(tasks[i].expected, (expected) => {
        expect(npmRun.spawnSync.mock.calls[i][0]).toEqual(expected.executable);
        expect(npmRun.spawnSync.mock.calls[i++][1]).toEqual(expected.args);
      });
    }
  });

  test('Should pass through environment variables merged with the parent environment', () => {
    const task = _.find(tasks, {key: 'publish'});

    run(task.key, task.cmdArgs, {file: filename});
    var count = 0;
    _.forEach(task.expected, (expected) => {
      expect(npmRun.spawnSync.mock.calls[count][0]).toEqual(expected.executable);
      expect(npmRun.spawnSync.mock.calls[count][1]).toEqual(expected.args);
      expect(npmRun.spawnSync.mock.calls[count++][2]).toEqual(expected.options);
    });
  });

  test('Should not continue to execute a sequence of commands when an error is returned', () => {
    const expectedError = new Error('Test error!');
    npmRun.spawnSync.mockImplementation(() => {
      return {
        status: 1,
        error: expectedError
      };
    });

    const task = _.find(tasks, {key: 'build_seq'});
    const expected = task.expected[0];

    expect(() => run(task.key, task.cmdArgs, {file: filename})).toThrow();
    expect(npmRun.spawnSync.mock.calls[0][0]).toEqual(expected.executable);
    expect(npmRun.spawnSync.mock.calls[0][1]).toEqual(expected.args);
    expect(npmRun.spawnSync).toHaveBeenCalledTimes(1);
  });

  test('Should continue to execute a sequence of commands when an error is returned on a command with ignore_errors: true', ()=> {
    npmRun.spawnSync.mockImplementation(() => {
      return {
        status: 1,
        error: new Error('Test error!')
      };
    });

    const task = _.find(tasks, {key: 'build_seq_ignore_errors'});

    run(task.key, task.cmdArgs, {file: filename});
    var count = 0;
    _.forEach(task.expected, (expected) => {
      expect(npmRun.spawnSync.mock.calls[count][0]).toEqual(expected.executable);
      expect(npmRun.spawnSync.mock.calls[count++][1]).toEqual(expected.args);
    });
  });

  test('Should save the result of a command to a variable', () => {
    const expectedDeployTarget = 'green';

    const task = {
      key: 'pass_value_to_next_command',
      cmdArgs: ['version=latest'],
      expected: [
        {
          executable: 'twoface',
          args: '-H consul.dun.fh -b blue -g green peek'.split(' '),
          options: {
            stdio: 'pipe'
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
    npmRun.spawnSync.mockImplementation(() => {
      return {
        status: 0,
        stdout: expectedDeployTarget
      };
    });

    run(task.key, task.cmdArgs, {file: filename});
    var count = 0;
    _.forEach(task.expected, (expected) => {
      expect(npmRun.spawnSync.mock.calls[count][0]).toEqual(expected.executable);
      expect(npmRun.spawnSync.mock.calls[count++][1]).toEqual(expected.args);
    });
  });

  test('Should retry a command if it fails', () => {
    const task = {
      key: 'retry',
      cmdArgs: [],
      expected: {
        executable: 'echo',
        args: 'test_retry'.split(' ')
      }
    };

    npmRun.spawnSync.mockImplementationOnce(() => {
      return {
        status: 1,
        error: new Error('Test Error')
      };
    });
    npmRun.spawnSync.mockImplementationOnce(() => {
      return {
        status: 0
      };
    });

    run(task.key, task.cmdArgs, {file: filename});
    expect(npmRun.spawnSync.mock.calls[0][0]).toEqual(task.expected.executable);
    expect(npmRun.spawnSync.mock.calls[0][1]).toEqual(task.expected.args);
    expect(npmRun.spawnSync).toHaveBeenCalledTimes(2);
  });

  test('Should throw if it exceeds the maximum number of retries', () => {
    const task = {
      key: 'retry',
      cmdArgs: [],
      expected: {
        executable: 'echo',
        args: 'test_retry'.split(' ')
      }
    };

    npmRun.spawnSync.mockImplementationOnce(() => {
      return {
        status: 1,
        error: new Error('Test Error')
      };
    });
    npmRun.spawnSync.mockImplementationOnce(() => {
      return {
        status: 1,
        error: new Error('Test Error')
      };
    });

    expect(() => run(task.key, task.cmdArgs, {file: filename})).toThrow();
    expect(npmRun.spawnSync.mock.calls[0][0]).toEqual(task.expected.executable);
    expect(npmRun.spawnSync.mock.calls[0][1]).toEqual(task.expected.args);
    expect(npmRun.spawnSync).toHaveBeenCalledTimes(2);
  });

  describe('When the command exits with an error', () => {
    test('Should throw with message "Command exited with error." when no error is present', () => {
      const task = {
        key: 'boom',
        cmdArgs: [],
        expected: {
          executable: 'echo',
          args: ['hello']
        }
      };

      npmRun.spawnSync.mockImplementationOnce(() => {
        return {
          status: 1,
          error: null
        };
      });

      expect(() => run(task.key, task.cmdArgs, {file: filename})).toThrow(Error, 'Command exited with error.');
      expect(npmRun.spawnSync.mock.calls[0][0]).toEqual(task.expected.executable);
      expect(npmRun.spawnSync.mock.calls[0][1]).toEqual(task.expected.args);
    });

    test('Should throw with the error message when error is present', () => {
      const task = {
        key: 'boom',
        cmdArgs: [],
        expected: {
          executable: 'echo',
          args: ['hello']
        }
      };
      const error = new Error('Test Error');
      npmRun.spawnSync.mockImplementationOnce(() => {
        return {
          status: 1,
          error: error
        };
      });

      expect(() => run(task.key, task.cmdArgs, {file: filename})).toThrow(error);
      expect(npmRun.spawnSync.mock.calls[0][0]).toEqual(task.expected.executable);
      expect(npmRun.spawnSync.mock.calls[0][1]).toEqual(task.expected.args);
    });
  });

});