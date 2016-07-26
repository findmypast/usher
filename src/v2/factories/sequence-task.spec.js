/* global describe before it expect sinon*/
'use strict';

const sut = require('./sequence-task');

describe('factories/sequence-task()', function() {
  describe('Given simple input', function() {
    const childTask = {
      description: 'A step',
      task: 'mock_task',
      arg: 'test-arg'
    };
    const spec = {
      name: 'test-task',
      description: 'It\'s a test',
      steps: [ childTask ]
    };

    const constructorSpy = sinon.spy();
    const execSpy = sinon.spy();
    const validateSpy = sinon.spy();
    const MockTask = class {
      constructor(args, Logger) {
        constructorSpy(args, Logger);
      }
      exec() {
        execSpy();
      }
      validate() {
        validateSpy();
      }
    };
    const instancing = {
      state: {
        tasks: {
          mock_task: MockTask
        }
      }
    };

    const beginSpy = sinon.spy();
    const endSpy = sinon.spy();
    const Logger = class {
      constructor(task) {
        this.name = task.name;
      }
      begin() {
        beginSpy(this.name);
      }
      end() {
        endSpy(this.name);
      }
    };

    let ResultingTask;
    let instance;

    before('the resulting class', function() {
      ResultingTask = sut(spec);
      instance = new ResultingTask(instancing, Logger);
    });

    it('instantiates successfully', function() {
      expect(instance).to.be.an.instanceof(ResultingTask);
    });

    it('constructs the child task', function() {
      expect(constructorSpy).to.have.been.calledWith(childTask, Logger);
    });
  });
});
