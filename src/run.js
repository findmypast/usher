'use strict';

const logger = require('winston');
const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');

let spawnSync = require('child_process').spawnSync;

function expandTokens(command, vars) {
  const template = _.template(command);

  return template(vars);
}

function resolveKeyValuePairs(array, vars) {
  const templated = vars ? _.map(array, a => expandTokens(a, vars)) : array;
  const split = _.map(templated, a => a.split('='));
  const hashed = _.fromPairs(split);
  return hashed;
}

function buildSpawnOptions(env) {
  return !_.isEmpty(env) ? { env: env, stdio: 'inherit' } : { stdio: 'inherit' };
}

function execCommand(command, vars) {
  if(!command.cmd) throw new Error('Command not defined')
  const parsedCommand = expandTokens(command.cmd, vars).split(" ");
  const parsedEnv = resolveKeyValuePairs(command.environment, vars);
  const spawnOptions = buildSpawnOptions(parsedEnv)

  logger.info(`Executing command : ${parsedCommand.join(" ")}`);

  const result = spawnSync(parsedCommand[0], _.tail(parsedCommand), spawnOptions);

  return (result.status !== 0 && !command.ignore_errors) ? false : true;
}

function getTaskConfig(taskName, taskVars, opts) {
  const usherFile = opts.filepath || '.usher.yml';
  const config = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));
  const parsedVars = resolveKeyValuePairs(taskVars);

  if(!_.isArray(config.tasks[taskName])) throw new Error('Tasks should be array of commands')

  return {
    vars: _.merge(config.vars, parsedVars),
    task: config.tasks[taskName]
  };
}

module.exports = (taskName, taskVars, opts) => {
  const taskConfig = getTaskConfig(taskName, taskVars, opts);

  _.forEach(taskConfig.task, command => execCommand(command, taskConfig.vars));
}
