'use strict';

const logger = require('winston');
const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
let TaskRunner = require('./modules/task-runner');

function getTaskConfig(taskName, taskVars, opts) {
  const usherFile = opts.filepath || '.usher.yml';
  const config = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));
  const splitVars = _.map(taskVars, a => a.split('='));
  const parsedVars = _.fromPairs(splitVars);

  if(!_.isArray(config.tasks[taskName])) throw new Error('Tasks should be array of commands')

  return {
    vars: _.merge(config.vars, parsedVars),
    task: config.tasks[taskName]
  };
}

module.exports = (taskName, taskVars, opts) => {
  const taskConfig = getTaskConfig(taskName, taskVars, opts);
  const taskRunner = new TaskRunner(taskConfig.task, taskConfig.vars);

  taskRunner.execute();
}
