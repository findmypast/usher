'use strict';

const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');

let spawnSync = require('child_process').spawnSync;

function expandTokens(command, vars) {
  const template = _.template(command);

  return template(vars);
}

module.exports = (taskName, taskVars, opts) => {
  const usherFile = opts.filepath || '.usher.yml';
  const splitVars = _.map(taskVars, a => a.split('='));
  const parsedVars = _.fromPairs(splitVars);
  const config = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));
  const vars = _.merge(config.vars, parsedVars);
  const command = expandTokens(config.tasks[taskName].cmd, vars);
  const commandArray = command.split(" ");

  spawnSync(commandArray[0], _.tail(commandArray));
}
