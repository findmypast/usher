'use strict';

const _ = require('lodash');
const logger = require('winston');
const snuze = require('snuze');
const getTaskConfig = require('./get-task-config');
const errno = require('errno');

let spawnSync = require('npm-run').spawnSync;

class TaskRunner {
  constructor(task, vars, opts) {
    this.task = task;
    this.vars = vars;
    this.opts = opts;
    this.attempts = 0;
  }

  execute() {
    logger.verbose('Starting task');
    const tasks = _.filter(this.task, (t) => t.cmd || t.task);

    _.forEach(tasks, command => {
      this.attempts = 0;

      if (command.cmd) {
        return this.runCommand(command);
      }
      else if (command.task) {
        if (command.for_all) {
          const vars = command.vars || {};
          return _.map(command.for_all, (x) => this.runTask(command.task, _.merge(vars, x)));
        }
        else {
          return this.runTask(command.task, command.vars);
        }
      }
      else {
        throw new Error('Task step contains no valid command');
      }
    });
    logger.verbose('Task completed successfully');
  }

  logCommand(parsedCommand, spawnOptions) {
    const command = parsedCommand.join(' ');
    const env = _.toPairs(spawnOptions.env)
      .map(x => `\n -${x[0]}=${x[1]}`)
      .join('');
    logger.info(`Executing command : ${command}`);
    logger.verbose(`Environment variables: ${env}`);
  }

  runTask(task, vars) {
    const cmdVars = _.mapValues(vars, this.expandTokens.bind(this));
    const taskVars = _.merge(this.vars, cmdVars);
    logger.info(`Executing task : ${task} with vars ${JSON.stringify(taskVars)}`);

    const taskConfig = getTaskConfig(task, taskVars, this.opts);
    const taskRunner = new TaskRunner(taskConfig.task, taskConfig.vars, this.opts);

    return taskRunner.execute();
  }

  extractArgs(cmd) {
    const parsedCommand = this.expandTokens(cmd).match(/["'][^"']+["']|\S+/g);

    return _.map(parsedCommand, pc => pc.replace(/['"]/g, ''));
  }

  runCommand(command) {
    // const parsedCommandl = this.expandTokens(command.cmd).split(' ');
    const parsedCommand = this.extractArgs(command.cmd);
    const parsedEnv = this.resolveKeyValuePairs(command.environment);
    const spawnOptions = this.buildSpawnOptions(command, parsedEnv);

    this.logCommand(parsedCommand, spawnOptions);

    this.attempts++;
    const executable = parsedCommand[0];
    const result = spawnSync(executable, _.tail(parsedCommand), spawnOptions);

    if (command.register && result.stdout) {
      const out = result.stdout.toString().trim();
      logger.info(`Saved ${out} to ${command.register}`);
      this.vars[command.register] = out;
    }

    if (this.shouldExecutionContinue(result, command)) {
      return true;
    }

    if (this.shouldCommandRetry(command)) {
      snuze.snooze(this.delayInMilliseconds(command.retry.delay));
      return this.runCommand(command);
    }

    if (result.error) {
      logger.error(`Command exited with non-zero exit status [${result.error.code}]. Aborting.`);
    }
    else {
      logger.error('Command exited with error. Aborting.');
    }

    if (errno.code[result.error.code]) {
      logger.error(`Error description: ${errno.code[result.error.code].description}`);
      logger.error(`Check the executable ${executable} exists.`);
    }

    if (result.error) {
      throw result.error;
    }
    else {
      throw new Error(`Command ${command.cmd} exited with error.`);
    }
  }

  shouldExecutionContinue(result, command) {
    return result.status === 0 || command.ignore_errors;
  }

  shouldCommandRetry(command) {
    return command.retry && this.attempts < command.retry.attempts;
  }

  expandTokens(str) {
    logger.verbose('Interpolating ERB tokens');
    const template = _.template(str);

    return template(this.vars);
  }

  resolveKeyValuePairs(array) {
    const templated = _.map(array, a => this.expandTokens(a, this.vars));
    const split = _.map(templated, a => a.split('='));
    const hashed = _.fromPairs(split);
    return hashed;
  }

  buildSpawnOptions(command, envOptions) {
    const stdout = command.register || this.opts.quiet ? 'pipe' : process.stdout;
    const env = _.isEmpty(envOptions) ? process.env : _.merge(envOptions, process.env);
    return {
      stdio: [process.stdin, stdout, process.stderr],
      env: env
    };
  }

  delayInMilliseconds(delay) {
    return delay * 1000;
  }
}

module.exports = TaskRunner;
