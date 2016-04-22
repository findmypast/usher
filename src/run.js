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

function execCommand(cmdTemplate, environment, vars) {
  if(!cmdTemplate) throw new Error('Command not defined')
  const command = expandTokens(cmdTemplate, vars).split(" ");
  const parsedEnv = resolveKeyValuePairs(environment, vars);
  const spawnOptions = buildSpawnOptions(parsedEnv)

  logger.info(`Executing command : ${command.join(" ")}`);

  return spawnSync(command[0], _.tail(command), spawnOptions)
}

module.exports = (taskName, taskVars, opts) => {
  const usherFile = opts.filepath || '.usher.yml';
  const parsedVars = resolveKeyValuePairs(taskVars);
  const config = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));
  const vars = _.merge(config.vars, parsedVars);
  const task = config.tasks[taskName];
  if(!_.isArray(task)) throw new Error('Tasks should be array of commands')

  _.forEach(task, command => {
    let result = execCommand(command.cmd, command.environment, vars);

    if (result.status !== 0 && !command.ignore_errors) {
      return false;
    }

    return true;
  });
}
