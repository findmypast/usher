/* global describe before after beforeEach it expect sandbox mockery mocks _*/
'use strict';

describe('factories/task', function() {
  let sut;
  const setup = sandbox.stub();
  const parse = sandbox.stub();
  const task = sandbox.stub();
  const logger = mocks.logger;
  const otherLogger = sandbox.stub();
  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable();
    mockery.warnOnUnregistered(false);
    mockery.registerMock('./setup', setup);
    mockery.registerMock('./parse', parse);
    mockery.registerMock('../core/task', task);
    mockery.registerMock('../loggers', {console: logger, other: otherLogger});

    sut = require('./run');
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  describe('given valid input', function() {
    const taskName = 'test_task';
    const taskVars = ['var=value', 'var2=value2'];
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
        }
      }
    };
    parse.returns(config);
    setup.returns(Promise.resolve({get: name => _.get(config.tasks, name)}));
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
          var3: 'value3'
        }
      }, logger));
    });
    it('given no vars calls setup with config', function() {
      return sut(taskName, [], {}).then(() => expect(setup).to.be.calledWith(config, logger));
    });
    it('runs the named task', function() {
      return sut(taskName, taskVars, {}).then(() => expect(task).to.be.calledWith(_.get(config.tasks, taskName)));
    });
    it('rejects if file fails to parse', function() {
      parse.throws(new Error('Test Error'));
      return expect(sut(taskName, [], {})).to.be.rejectedWith(/usher\.yml.*Test Error/);
    });
  });
});
