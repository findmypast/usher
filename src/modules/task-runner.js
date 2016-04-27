'use strict';

const _ = require('lodash');
const logger = require('winston');

let spawnSync = require('npm-run').spawnSync;

class TaskRunner {
  constructor(task, vars) {
    this.task = task;
    this.vars = vars;
  }

  execute() {
    _.forEach(this.task, command => this.runCommand(command));
  }

  runCommand(command) {
    if(!command.cmd) throw new Error('Command not defined')
    const parsedCommand = this.expandTokens(command.cmd).split(" ");
    const parsedEnv = this.resolveKeyValuePairs(command.environment);
    const spawnOptions = this.buildSpawnOptions(parsedEnv)

    logger.info(`Executing command : ${parsedCommand.join(" ")}`);

    const result = spawnSync(parsedCommand[0], _.tail(parsedCommand), spawnOptions);

    if (command.register) {
      this.vars[command.register] = result.stdout;
    }

    return this.shouldExecutionContinue(result, command);
  }

  shouldExecutionContinue(result, command) {
    return result.status === 0 || command.ignore_errors || false;
  }

  expandTokens(command) {
    const template = _.template(command);

    return template(this.vars);
  }

  resolveKeyValuePairs(array) {
    const templated = _.map(array, a => this.expandTokens(a, this.vars));
    const split = _.map(templated, a => a.split('='));
    const hashed = _.fromPairs(split);
    return hashed;
  }

  buildSpawnOptions(env) {
    return !_.isEmpty(env) ? { env: env, stdio: 'inherit' } : { stdio: 'inherit' };
  }
};

module.exports = TaskRunner;
