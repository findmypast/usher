'use strict';

const _ = require('lodash');
const logger = require('winston');
const sleep = require('sleep');

let spawnSync = require('npm-run').spawnSync;

class TaskRunner {
  constructor(task, vars) {
    this.task = task;
    this.vars = vars;
    this.attempts = 0;
  }

  execute() {
    _.forEach(this.task, command => {
      this.attempts = 0;
      return this.runCommand(command);
    });
  }

  runCommand(command) {
    if(!command.cmd) throw new Error('Command not defined')
    const parsedCommand = this.expandTokens(command.cmd).split(" ");
    const parsedEnv = this.resolveKeyValuePairs(command.environment);
    const spawnOptions = this.buildSpawnOptions(command, parsedEnv)

    logger.info(`Executing command : ${parsedCommand.join(" ")}  \n Env : ${parsedEnv}`);

    this.attempts++;
    const result = spawnSync(parsedCommand[0], _.tail(parsedCommand), spawnOptions);

    if (command.register && result.stdout) {
      const out = result.stdout.toString().trim();
      logger.info(`Saved ${out} to ${command.register}`);
      this.vars[command.register] = out;
    }

    if(this.shouldExecutionContinue(result, command)) {
      return true;
    }
    if(this.shouldCommandRetry(command)) {
      sleep.usleep(command.retry.delay * 1000000);
      return this.runCommand(command);
    }
    throw result.error;
  }

  shouldExecutionContinue(result, command) {
    return result.status === 0 || command.ignore_errors;
  }

  shouldCommandRetry(command) {
    return command.retry && this.attempts < command.retry.attempts;
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

  buildSpawnOptions(command, envOptions) {
    const stdio = command.register ? "pipe" : "inherit";
    const env = _.isEmpty(envOptions) ? process.env : _.merge(envOptions, process.env);
    return {
      stdio: stdio,
      env: env
    };
  }
};

module.exports = TaskRunner;
