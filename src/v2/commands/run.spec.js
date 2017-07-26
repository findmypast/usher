/* global describe before after beforeEach it expect sandbox mockery mocks _ errors*/
'use strict';

describe('commands/run', function() {
  let sut;
  const setup = sandbox.stub();
  const parse = sandbox.stub();
  const task = sandbox.stub().resolves();
  const Logger = mocks.Logger;
  const otherLogger = sandbox.stub();
  const quietLogger = sandbox.stub();
  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.registerMock('./setup', setup);
    mockery.registerMock('./parse', parse);
    mockery.registerMock('../core/task', task);
    mockery.registerMock('../lib/errors', errors);
    mockery.registerMock('../loggers', {default: Logger, verbose: otherLogger, quiet: quietLogger});

    sut = require('./run');
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  describe('given valid input', function() {
    const taskName = 'test_task';
    const taskVars = ['var=value', 'var2=value2', 'var4="multiline=is\nsomething"'];
    const opts = {
      file: 'foo.yml',
      logger: 'other'
    };
    const config = {
      vars: {
        var: 'wrong',
        var3: 'value3'
      },
      tasks: {
        test_task: {
          do: 'test'
        },
        build_task: {
          do: 'build',
          finally_task: 'the_end'
        },
        the_end: {
          do: 'end_all'
        },
        global: {
          tasks: {
            mr_remote: {
              tasks: {
                keep_changing: {
                  do: 'change'
                }
              }
            }
          }
        },
        catch: {
          do: 'error_handling'
        },
        finally: {
          do: 'final_cleanup'
        }
      }
    };

    before(() => {
      parse.returns(config);
      setup.returns(Promise.resolve({get: path => _.get(config, path)}));
    });

    it('calls parse on the file name defined in opts', function() {
      return sut(taskName, taskVars, opts).then(() => expect(parse).to.be.calledWith(opts.file));
    });
    it('calls parse on "usher.yml" if no file option', function() {
      return sut(taskName, taskVars, {}).then(() => expect(parse).to.be.calledWith('usher.yml'));
    });
    it('parses CLI vars and merges them into config before calling setup', function() {
      return sut(taskName, taskVars, {}).then(() => expect(setup).to.be.calledWith({
        tasks: config.tasks,
        vars: {
          var: 'value',
          var2: 'value2',
          var3: 'value3',
          var4: '"multiline=is\nsomething"'
        }
      }, Logger));
    });
    it('given no vars calls setup with config', function() {
      return sut(taskName, [], {}).then(() => expect(setup).to.be.calledWith(config, Logger));
    });
    it('if passed the option verbose use verbose logger', function() {
      return sut(taskName, [], {verbose: true}).then(() => expect(setup).to.be.calledWith(config, otherLogger));
    });
    it('if passed the option quiet use quiet logger', function() {
      return sut(taskName, [], {quiet: true}).then(() => expect(setup).to.be.calledWith(config, quietLogger));
    });
    it('runs the named task', function() {
      return sut(taskName, taskVars, {}).then(() => expect(task).to.be.calledWith(_.get(config.tasks, taskName)));
    });
    it('rejects if named task is not found', function() {
      return expect(sut('wrong', taskVars, {})).to.be.rejectedWith(errors.TaskNotFoundError, /wrong/);
    });
    it('rejects if file fails to parse', function() {
      parse.throws(new Error('Test Error'));
      return expect(sut(taskName, [], {})).to.be.rejectedWith(/usher\.yml.*Test Error/);
    });

    it('runs the named remote task', function() {

      parse.returns(config);
      setup.returns(Promise.resolve({get: path => _.get(config, path)}));

      return sut('global.mr_remote.keep_changing', taskVars, {})
      .then(() => expect(task).to.be
        .calledWith(_.get(config.tasks, 'global.tasks.mr_remote.tasks.keep_changing')));
    });

    it('calls the "catch" task when the called task fails', () => {
      task.onCall(0).rejects('Task error');
      task.onCall(1).resolves();
      task.onCall(1).resolves();

      return sut('test_task', taskVars, {})
        .catch(() => {
          expect(task).to.be.calledWith(_.get(config.tasks, 'catch'));
        });
    });

    it('calls the "finally" task when the called task succeeds', () => {
      task.onCall(0).resolves();
      task.onCall(1).resolves();
      task.onCall(2).resolves();

      return sut('test_task', taskVars, {})
        .then(() => {
          expect(task).to.be.calledWith(_.get(config.tasks, 'finally'));
        });
    });

    it('calls the task-specific "finally" task when the called task succeeds', () => {
      task.onCall(0).resolves();
      task.onCall(1).resolves();
      task.onCall(2).resolves();

      return sut('build_task', taskVars, {})
        .then(() => {
          expect(task).to.be.calledWith(_.get(config.tasks, 'the_end'));
        });
    });

    it('should return both errors when the called task fails and the catch/finally task fails', () => {
      task.onCall(0).rejects('Task error');
      task.onCall(1).rejects('Catch error');
      task.onCall(2).resolves();

      return sut('test_task', taskVars, {})
        .catch(err => {
          expect(err).to.equal(`Unrecoverable error when handling catch/finally block:\nError: Catch error\nOriginal error:\nError: Task error`);
        });
    });
  });

  describe('given valid input with no catch or finally tasks', function() {
    const taskVars = ['var=value', 'var2=value2', 'var4="multiline=is\nsomething"'];
    const config = {
      vars: {
        var: 'wrong',
        var3: 'value3'
      },
      tasks: {
        test_task: {
          do: 'test'
        },
        global: {
          tasks: {
            mr_remote: {
              tasks: {
                keep_changing: {
                  do: 'change'
                }
              }
            }
          }
        }
      }
    };

    before(() => {
      parse.returns(config);
      setup.returns(Promise.resolve({get: path => _.get(config, path)}));
    });

    it('should silently ignore the missing catch/final task when the main task fails', function() {
      task.onCall(0).rejects('Task error');
      task.onCall(1).resolves();
      task.onCall(2).resolves();

      return sut('test_task', taskVars, {})
        .catch(err => {
          expect(err.toString()).to.equal('Error: Task error');
        });
    });
  });
});
