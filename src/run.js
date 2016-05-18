'use strict';

let TaskRunner = require('./modules/task-runner');
const _ = require('lodash');
const getTaskConfig = require('./modules/get-task-config');

module.exports = (taskName, taskVars, opts) => {
  const splitVars = _.map(taskVars, a => a.split('='));
  const parsedVars = _.fromPairs(splitVars);
  const taskConfig = getTaskConfig(taskName, parsedVars, opts);
  const taskRunner = new TaskRunner(taskConfig.task, taskConfig.vars, opts);

  taskRunner.execute();
};
